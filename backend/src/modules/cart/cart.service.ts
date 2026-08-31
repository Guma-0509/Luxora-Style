import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CouponsService } from '../coupons/coupons.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CalculateCheckoutDto, ShippingMethodOption } from './dto/calculate-checkout.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly couponsService: CouponsService,
  ) {}

  async getCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) {
      throw new BadRequestException('Se requiere identificador de usuario o sesión');
    }

    const cart = await this.prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    images: { where: { isMain: true }, take: 1 },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      return {
        id: null,
        items: [],
        subtotal: 0,
        itemCount: 0,
      };
    }

    const subtotal = cart.items.reduce(
      (acc, item) => acc + Number(item.unitPrice) * item.quantity,
      0,
    );
    const itemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    return {
      id: cart.id,
      items: cart.items,
      subtotal: Number(subtotal.toFixed(2)),
      itemCount,
    };
  }

  async addItem(dto: AddToCartDto, userId?: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
    });

    if (!variant || !variant.isActive) {
      throw new NotFoundException('La variante de producto seleccionada no está disponible');
    }

    const requestedQty = dto.quantity || 1;
    if (variant.stock < requestedQty) {
      throw new BadRequestException(
        `Stock insuficiente. Solo quedan ${variant.stock} unidades disponibles`,
      );
    }

    // Buscar o crear carrito
    let cart = await this.prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId: dto.sessionId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId: userId || null,
          sessionId: !userId ? dto.sessionId : null,
        },
      });
    }

    // Verificar si el item ya existe en el carrito
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: dto.variantId,
        },
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + requestedQty;
      if (variant.stock < newQty) {
        throw new BadRequestException(
          `No puedes agregar más unidades. El stock máximo disponible es ${variant.stock}`,
        );
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQty,
          unitPrice: variant.price,
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: dto.variantId,
          quantity: requestedQty,
          unitPrice: variant.price,
        },
      });
    }

    return this.getCart(userId, dto.sessionId);
  }

  async updateItemQuantity(itemId: string, dto: UpdateCartItemDto, userId?: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { variant: true, cart: true },
    });

    if (!item) {
      throw new NotFoundException('Item de carrito no encontrado');
    }

    if (userId && item.cart.userId !== userId) {
      throw new BadRequestException('Acceso no autorizado a este carrito');
    }

    if (item.variant.stock < dto.quantity) {
      throw new BadRequestException(
        `Stock insuficiente. El stock máximo disponible es de ${item.variant.stock} unidades`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.getCart(userId, item.cart.sessionId || undefined);
  }

  async removeItem(itemId: string, userId?: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item) {
      throw new NotFoundException('Item de carrito no encontrado');
    }

    if (userId && item.cart.userId !== userId) {
      throw new BadRequestException('Acceso no autorizado a este carrito');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCart(userId, item.cart.sessionId || undefined);
  }

  async clearCart(userId?: string, sessionId?: string) {
    const cart = await this.prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
    });

    if (cart) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    return { message: 'Carrito vaciado exitosamente' };
  }

  // ==========================================
  // CÁLCULO ATÓMICO DE CHECKOUT
  // ==========================================

  async calculateCheckout(dto: CalculateCheckoutDto, userId?: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('El pedido debe incluir al menos un producto');
    }

    const variantIds = dto.items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: { where: { isMain: true }, take: 1 },
          },
        },
      },
    });

    if (variants.length !== dto.items.length) {
      throw new NotFoundException('Algunas de las variantes solicitadas ya no existen en el catálogo');
    }

    // Validar disponibilidad de stock y armar items verificados
    let subtotal = 0;
    const validatedItems = [];

    for (const itemDto of dto.items) {
      const variant = variants.find((v) => v.id === itemDto.variantId);
      if (!variant || !variant.isActive) {
        throw new BadRequestException(`El artículo ${itemDto.variantId} está inactivo o descontinuado`);
      }

      if (variant.stock < itemDto.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para ${variant.title}. Disponible: ${variant.stock}, solicitado: ${itemDto.quantity}`,
        );
      }

      const unitPrice = Number(variant.price);
      const itemSubtotal = unitPrice * itemDto.quantity;
      subtotal += itemSubtotal;

      validatedItems.push({
        variantId: variant.id,
        sku: variant.sku,
        productName: variant.product.name,
        variantTitle: variant.title,
        attributes: variant.attributes,
        unitPrice,
        costPrice: variant.costPrice ? Number(variant.costPrice) : null,
        quantity: itemDto.quantity,
        subtotal: Number(itemSubtotal.toFixed(2)),
        imageUrl: variant.imageUrl || variant.product.images[0]?.url,
      });
    }

    // Configuración de la tienda
    const freeShippingThreshold = 150.0;
    const baseShippingCost = 15.0;
    const expressShippingCost = 25.0;
    const taxRate = 0.18; // 18% ITBIS / Tax estándar

    // Aplicación de Cupón
    let discountTotal = 0;
    let couponDetails = null;

    if (dto.couponCode) {
      try {
        const couponResult = await this.couponsService.validateCoupon(
          { code: dto.couponCode, subtotal },
          userId,
        );
        discountTotal = couponResult.discountAmount;
        couponDetails = couponResult;
      } catch (err: any) {
        throw new BadRequestException(err.message || 'Cupón inválido');
      }
    }

    // Cálculo de Costo de Envío
    let shippingTotal = 0;
    if (dto.shippingMethod === ShippingMethodOption.EXPRESS) {
      shippingTotal = expressShippingCost;
    } else {
      shippingTotal = subtotal >= freeShippingThreshold ? 0 : baseShippingCost;
    }

    // Base imponible y cálculo de impuestos
    const taxableBase = Math.max(subtotal - discountTotal, 0);
    const taxTotal = Number((taxableBase * taxRate).toFixed(2));

    const grandTotal = Number((taxableBase + shippingTotal + taxTotal).toFixed(2));

    return {
      items: validatedItems,
      subtotal: Number(subtotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2)),
      taxTotal,
      shippingTotal: Number(shippingTotal.toFixed(2)),
      grandTotal,
      coupon: couponDetails,
      shippingMethod: dto.shippingMethod || ShippingMethodOption.STANDARD,
      isFreeShipping: shippingTotal === 0,
      freeShippingThreshold,
    };
  }
}
