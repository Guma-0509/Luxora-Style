import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CouponsService } from '../coupons/coupons.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderFilterDto } from './dto/order-filter.dto';
import { MovementType, OrderStatus, PaymentStatus, Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly couponsService: CouponsService,
  ) {}

  async createOrder(dto: CreateOrderDto, userId: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('El pedido debe contener al menos un producto');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Validar variantes e inventario en tiempo real
      const variantIds = dto.items.map((i) => i.variantId);
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: {
          product: { select: { id: true, name: true, slug: true } },
        },
      });

      if (variants.length !== dto.items.length) {
        throw new NotFoundException('Algunas variantes seleccionadas ya no existen');
      }

      let subtotal = 0;
      const orderItemsData = [];

      for (const itemDto of dto.items) {
        const variant = variants.find((v) => v.id === itemDto.variantId);
        if (!variant || !variant.isActive) {
          throw new BadRequestException(`El artículo ${itemDto.variantId} está inactivo`);
        }

        if (variant.stock < itemDto.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para ${variant.title}. Disponible: ${variant.stock}, solicitado: ${itemDto.quantity}`,
          );
        }

        const unitPrice = Number(variant.price);
        const itemSubtotal = unitPrice * itemDto.quantity;
        subtotal += itemSubtotal;

        // Deducir inventario atómicamente
        const previousStock = variant.stock;
        const newStock = previousStock - itemDto.quantity;

        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: newStock },
        });

        // Registrar movimiento de salida por venta (SALE)
        await tx.inventoryMovement.create({
          data: {
            variantId: variant.id,
            previousStock,
            quantityModified: -itemDto.quantity,
            newStock,
            type: MovementType.SALE,
            reason: `Venta en orden nueva`,
            userId,
          },
        });

        orderItemsData.push({
          variantId: variant.id,
          productName: variant.product.name,
          variantTitle: variant.title,
          sku: variant.sku,
          attributes: variant.attributes as any,
          unitPrice,
          costPrice: variant.costPrice ? Number(variant.costPrice) : null,
          quantity: itemDto.quantity,
          subtotal: Number(itemSubtotal.toFixed(2)),
        });
      }

      // 2. Gestionar dirección de entrega
      let addressId = dto.addressId;
      if (!addressId && dto.shippingAddress) {
        const newAddr = await tx.address.create({
          data: {
            userId,
            recipientName: dto.shippingAddress.recipientName,
            phone: dto.shippingAddress.phone,
            streetAddress: dto.shippingAddress.streetAddress,
            apartment: dto.shippingAddress.apartment,
            city: dto.shippingAddress.city,
            state: dto.shippingAddress.state,
            postalCode: dto.shippingAddress.postalCode,
            country: dto.shippingAddress.country || 'DO',
          },
        });
        addressId = newAddr.id;
      }

      // 3. Aplicar cupón de descuento
      let discountTotal = 0;
      if (dto.couponCode) {
        const couponResult = await this.couponsService.validateCoupon(
          { code: dto.couponCode, subtotal },
          userId,
        );
        discountTotal = couponResult.discountAmount;

        // Incrementar contador de uso del cupón
        await tx.coupon.update({
          where: { code: dto.couponCode.toUpperCase().trim() },
          data: { currentUsageCount: { increment: 1 } },
        });
      }

      // 4. Cálculos finales
      const freeShippingThreshold = 150.0;
      const shippingTotal = subtotal >= freeShippingThreshold ? 0 : 15.0;
      const taxRate = 0.18;
      const taxableBase = Math.max(subtotal - discountTotal, 0);
      const taxTotal = Number((taxableBase * taxRate).toFixed(2));
      const grandTotal = Number((taxableBase + shippingTotal + taxTotal).toFixed(2));

      // Generar número de orden amigable
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const orderNumber = `ORD-${datePart}-${randomSuffix}`;

      // 5. Crear Orden
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId,
          status: OrderStatus.PENDING,
          subtotal,
          discountTotal,
          taxTotal,
          shippingTotal,
          grandTotal,
          couponCode: dto.couponCode ? dto.couponCode.toUpperCase() : null,
          notes: dto.notes,
          items: {
            create: orderItemsData,
          },
          payment: {
            create: {
              amount: grandTotal,
              method: dto.paymentMethod,
              status: PaymentStatus.PENDING,
              transactionId: `TXN-${Date.now()}`,
            },
          },
        },
        include: {
          items: true,
          payment: true,
          shippingAddress: true,
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      });

      // 6. Vaciar carrito del usuario si existe
      await tx.cart.deleteMany({ where: { userId } });

      // 7. Auditoría
      await tx.auditLog.create({
        data: {
          userId,
          action: 'CREATE_ORDER',
          entity: 'Order',
          entityId: order.id,
          newData: { orderNumber: order.orderNumber, grandTotal: order.grandTotal },
        },
      });

      return order;
    });
  }

  async getMyOrders(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              variant: {
                select: { imageUrl: true },
              },
            },
          },
          payment: true,
          shippingAddress: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getMyOrderById(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
        userId,
      },
      include: {
        items: {
          include: {
            variant: {
              select: {
                imageUrl: true,
                product: { select: { slug: true } },
              },
            },
          },
        },
        payment: true,
        shippingAddress: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return order;
  }

  // ==========================================
  // ADMINISTRACIÓN DE PEDIDOS
  // ==========================================

  async findAllAdmin(filter: OrderFilterDto) {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      userId,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (status) where.status = status;
    if (userId) where.userId = userId;

    if (paymentStatus) {
      where.payment = { status: paymentStatus };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { trackingNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
          payment: true,
          shippingAddress: true,
          _count: { select: { items: true } },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOneAdmin(id: string) {
    const order = await this.prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        items: {
          include: {
            variant: {
              select: {
                id: true,
                sku: true,
                stock: true,
                imageUrl: true,
                product: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
        payment: true,
        shippingAddress: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, adminUserId: string) {
    const order = await this.findOneAdmin(id);

    return this.prisma.$transaction(async (tx) => {
      // Si la orden pasa a CANCELLED o REFUNDED desde un estado no cancelado previo, reponer inventario
      if (
        (dto.status === OrderStatus.CANCELLED || dto.status === OrderStatus.REFUNDED) &&
        order.status !== OrderStatus.CANCELLED &&
        order.status !== OrderStatus.REFUNDED
      ) {
        for (const item of order.items) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          });

          if (variant) {
            const previousStock = variant.stock;
            const newStock = previousStock + item.quantity;

            await tx.productVariant.update({
              where: { id: variant.id },
              data: { stock: newStock },
            });

            await tx.inventoryMovement.create({
              data: {
                variantId: variant.id,
                previousStock,
                quantityModified: item.quantity,
                newStock,
                type: MovementType.RETURN,
                reason: `Devolución de stock por cancelación de pedido ${order.orderNumber}`,
                userId: adminUserId,
              },
            });
          }
        }
      }

      // Si el estado pasa a PAID, actualizar estado del pago
      if (dto.status === OrderStatus.PAID && order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: {
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(),
          },
        });
      }

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: dto.status,
          ...(dto.trackingNumber && { trackingNumber: dto.trackingNumber }),
          ...(dto.carrier && { carrier: dto.carrier }),
        },
        include: {
          payment: true,
          items: true,
          shippingAddress: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'UPDATE_ORDER_STATUS',
          entity: 'Order',
          entityId: order.id,
          previousData: { status: order.status },
          newData: {
            status: updatedOrder.status,
            trackingNumber: updatedOrder.trackingNumber,
            carrier: updatedOrder.carrier,
            note: dto.note,
          },
        },
      });

      return updatedOrder;
    });
  }
}
