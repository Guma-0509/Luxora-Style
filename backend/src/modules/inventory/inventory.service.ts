import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { InventoryFilterDto } from './dto/inventory-filter.dto';
import { MovementType, Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // ADMINISTRACIÓN DE VARIANTES
  // ==========================================

  async createVariant(dto: CreateVariantDto, userId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException(`Producto con ID ${dto.productId} no encontrado`);
    }

    const existingSku = await this.prisma.productVariant.findUnique({
      where: { sku: dto.sku },
    });

    if (existingSku) {
      throw new ConflictException(`Ya existe una variante con el SKU '${dto.sku}'`);
    }

    return this.prisma.$transaction(async (tx) => {
      const initialStock = dto.stock || 0;

      const variant = await tx.productVariant.create({
        data: {
          productId: dto.productId,
          sku: dto.sku,
          title: dto.title,
          attributes: dto.attributes,
          price: dto.price,
          compareAtPrice: dto.compareAtPrice,
          costPrice: dto.costPrice,
          stock: initialStock,
          weight: dto.weight,
          imageUrl: dto.imageUrl,
          isActive: dto.isActive !== undefined ? dto.isActive : true,
        },
      });

      // Si se definió un stock inicial mayor a 0, registrar el movimiento de almacén
      if (initialStock > 0) {
        await tx.inventoryMovement.create({
          data: {
            variantId: variant.id,
            previousStock: 0,
            quantityModified: initialStock,
            newStock: initialStock,
            type: MovementType.PURCHASE,
            reason: 'Stock inicial al crear la variante',
            userId: userId || null,
          },
        });
      }

      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            action: 'CREATE_VARIANT',
            entity: 'ProductVariant',
            entityId: variant.id,
            newData: { sku: variant.sku, title: variant.title, stock: variant.stock },
          },
        });
      }

      return variant;
    });
  }

  async updateVariant(id: string, dto: UpdateVariantDto, userId?: string) {
    const existing = await this.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Variante con ID ${id} no encontrada`);
    }

    if (dto.sku && dto.sku !== existing.sku) {
      const skuConflict = await this.prisma.productVariant.findUnique({
        where: { sku: dto.sku },
      });
      if (skuConflict) {
        throw new ConflictException(`Ya existe otra variante con el SKU '${dto.sku}'`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.productVariant.update({
        where: { id },
        data: {
          ...(dto.sku && { sku: dto.sku }),
          ...(dto.title && { title: dto.title }),
          ...(dto.attributes && { attributes: dto.attributes }),
          ...(dto.price !== undefined && { price: dto.price }),
          ...(dto.compareAtPrice !== undefined && { compareAtPrice: dto.compareAtPrice }),
          ...(dto.costPrice !== undefined && { costPrice: dto.costPrice }),
          ...(dto.weight !== undefined && { weight: dto.weight }),
          ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
      });

      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            action: 'UPDATE_VARIANT',
            entity: 'ProductVariant',
            entityId: id,
            previousData: { sku: existing.sku, price: existing.price, isActive: existing.isActive },
            newData: { sku: updated.sku, price: updated.price, isActive: updated.isActive },
          },
        });
      }

      return updated;
    });
  }

  async deleteVariant(id: string, userId?: string) {
    const existing = await this.prisma.productVariant.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orderItems: true, cartItems: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Variante con ID ${id} no encontrada`);
    }

    // Si tiene pedidos asociados, desactivar en lugar de eliminar
    if (existing._count.orderItems > 0) {
      await this.prisma.productVariant.update({
        where: { id },
        data: { isActive: false },
      });
      return { message: 'La variante tiene pedidos históricos y fue desactivada en lugar de eliminada' };
    }

    await this.prisma.productVariant.delete({
      where: { id },
    });

    if (userId) {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'DELETE_VARIANT',
          entity: 'ProductVariant',
          entityId: id,
          previousData: { sku: existing.sku, title: existing.title },
        },
      });
    }

    return { message: 'Variante eliminada exitosamente' };
  }

  // ==========================================
  // MOVIMIENTOS TRANSACCIONALES DE STOCK
  // ==========================================

  async adjustStock(dto: AdjustStockDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: dto.variantId },
        include: {
          product: { select: { name: true } },
        },
      });

      if (!variant) {
        throw new NotFoundException(`Variante con ID ${dto.variantId} no encontrada`);
      }

      const previousStock = variant.stock;
      const newStock = previousStock + dto.quantityModified;

      if (newStock < 0) {
        throw new BadRequestException(
          `Operación inválida: El stock resultante (${newStock}) no puede ser negativo. Stock actual: ${previousStock}`,
        );
      }

      // 1. Actualizar el stock de la variante
      const updatedVariant = await tx.productVariant.update({
        where: { id: dto.variantId },
        data: { stock: newStock },
      });

      // 2. Registrar el movimiento inmutable en el historial
      const movement = await tx.inventoryMovement.create({
        data: {
          variantId: dto.variantId,
          previousStock,
          quantityModified: dto.quantityModified,
          newStock,
          type: dto.type,
          reason: dto.reason || 'Ajuste manual de inventario desde el panel administrativo',
          userId,
        },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      });

      // 3. Auditoría de seguridad
      await tx.auditLog.create({
        data: {
          userId,
          action: 'STOCK_ADJUSTMENT',
          entity: 'InventoryMovement',
          entityId: movement.id,
          previousData: { stock: previousStock },
          newData: {
            variantSku: variant.sku,
            quantityModified: dto.quantityModified,
            newStock,
            type: dto.type,
            reason: dto.reason,
          },
        },
      });

      return {
        movement,
        variant: updatedVariant,
        message: `Inventario actualizado: de ${previousStock} a ${newStock} unidades`,
      };
    });
  }

  // ==========================================
  // CONSULTAS DE INVENTARIO Y ALERTAS
  // ==========================================

  async getInventoryStatus(filter: InventoryFilterDto) {
    const {
      page = 1,
      limit = 20,
      search,
      productId,
      categoryId,
      brandId,
      lowStockThreshold = 5,
      outOfStockOnly,
      lowStockOnly,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const skip = (page - 1) * limit;

    const productWhere: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    if (categoryId) productWhere.categoryId = categoryId;
    if (brandId) productWhere.brandId = brandId;

    const where: Prisma.ProductVariantWhereInput = {
      product: productWhere,
    };

    if (productId) where.productId = productId;

    if (outOfStockOnly) {
      where.stock = 0;
    } else if (lowStockOnly) {
      where.stock = { gt: 0, lte: lowStockThreshold };
    }

    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [variants, total, allVariantsCounts] = await Promise.all([
      this.prisma.productVariant.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: { select: { name: true } },
              brand: { select: { name: true } },
            },
          },
          _count: {
            select: { inventoryMovements: true },
          },
        },
        skip,
        take: limit,
        orderBy: sortBy === 'stock' ? { stock: sortOrder } : { createdAt: sortOrder },
      }),
      this.prisma.productVariant.count({ where }),
      this.prisma.productVariant.aggregate({
        _count: { id: true },
        _sum: { stock: true },
        where: { product: { deletedAt: null } },
      }),
    ]);

    const [outOfStockCount, lowStockCount] = await Promise.all([
      this.prisma.productVariant.count({
        where: { product: { deletedAt: null }, stock: 0 },
      }),
      this.prisma.productVariant.count({
        where: { product: { deletedAt: null }, stock: { gt: 0, lte: lowStockThreshold } },
      }),
    ]);

    const enrichedVariants = variants.map((v) => {
      let status = 'IN_STOCK';
      if (v.stock === 0) status = 'OUT_OF_STOCK';
      else if (v.stock <= lowStockThreshold) status = 'LOW_STOCK';

      return {
        ...v,
        stockStatus: status,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: enrichedVariants,
      metrics: {
        totalVariants: allVariantsCounts._count.id,
        totalUnitsInStock: allVariantsCounts._sum.stock || 0,
        outOfStockCount,
        lowStockCount,
      },
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

  async getVariantMovements(variantId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { select: { name: true } } },
    });

    if (!variant) {
      throw new NotFoundException(`Variante con ID ${variantId} no encontrada`);
    }

    const [movements, total] = await Promise.all([
      this.prisma.inventoryMovement.findMany({
        where: { variantId },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inventoryMovement.count({ where: { variantId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      variant: {
        id: variant.id,
        sku: variant.sku,
        title: variant.title,
        productName: variant.product.name,
        currentStock: variant.stock,
      },
      data: movements,
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
}
