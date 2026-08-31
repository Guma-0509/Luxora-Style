import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ProductStatus, Prisma } from '@prisma/client';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // CONSULTAS PÚBLICAS (STOREFRONT)
  // ==========================================

  async findAllPublic(filter: ProductFilterDto) {
    const {
      page = 1,
      limit = 20,
      search,
      categorySlug,
      categoryId,
      brandSlug,
      brandId,
      minPrice,
      maxPrice,
      isFeatured,
      isNewArrival,
      inStockOnly,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.PUBLISHED,
      deletedAt: null,
    };

    // Búsqueda textual
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Filtro por Categoría (incluye subcategorías)
    if (categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: categorySlug },
        include: { subcategories: { select: { id: true } } },
      });
      if (category) {
        const categoryIds = [category.id, ...category.subcategories.map((c) => c.id)];
        where.categoryId = { in: categoryIds };
      }
    } else if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filtro por Marca
    if (brandSlug) {
      where.brand = { slug: brandSlug };
    } else if (brandId) {
      where.brandId = brandId;
    }

    // Filtro por Rango de Precios
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
    }

    // Flags
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isNewArrival !== undefined) where.isNewArrival = isNewArrival;

    // Solo con stock
    if (inStockOnly) {
      where.variants = {
        some: {
          stock: { gt: 0 },
          isActive: true,
        },
      };
    }

    // Ordenamiento dinámico
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'price') {
      orderBy = { basePrice: sortOrder };
    } else if (sortBy === 'name') {
      orderBy = { name: sortOrder };
    } else if (sortBy === 'createdAt') {
      orderBy = { createdAt: sortOrder };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
          images: { orderBy: [{ isMain: 'desc' }, { displayOrder: 'asc' }] },
          variants: {
            where: { isActive: true },
            select: { id: true, sku: true, title: true, price: true, compareAtPrice: true, stock: true, attributes: true },
          },
          reviews: {
            where: { status: 'APPROVED' },
            select: { rating: true },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.product.count({ where }),
    ]);

    // Enriquecer con cálculo de promedio de reseñas y stock total
    const enrichedProducts = products.map((prod) => {
      const totalReviews = prod.reviews.length;
      const averageRating =
        totalReviews > 0
          ? Number((prod.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
          : 5.0;

      const totalStock = prod.variants.reduce((acc, v) => acc + v.stock, 0);

      return {
        ...prod,
        reviewsSummary: {
          averageRating,
          totalReviews,
        },
        totalStock,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: enrichedProducts,
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

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: ProductStatus.PUBLISHED, deletedAt: null },
      include: {
        category: {
          include: {
            parent: true,
          },
        },
        brand: true,
        images: { orderBy: [{ isMain: 'desc' }, { displayOrder: 'asc' }] },
        specifications: { orderBy: { displayOrder: 'asc' } },
        variants: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
        reviews: {
          where: { status: 'APPROVED' },
          include: {
            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto '${slug}' no encontrado o no disponible`);
    }

    const totalReviews = product.reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number((product.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
        : 5.0;

    // Productos relacionados (misma categoría o misma marca)
    const relatedProducts = await this.prisma.product.findMany({
      where: {
        status: ProductStatus.PUBLISHED,
        deletedAt: null,
        id: { not: product.id },
        OR: [{ categoryId: product.categoryId }, { brandId: product.brandId }],
      },
      include: {
        images: { where: { isMain: true }, take: 1 },
        brand: { select: { name: true } },
      },
      take: 8,
    });

    return {
      ...product,
      reviewsSummary: {
        averageRating,
        totalReviews,
      },
      relatedProducts,
    };
  }

  async findFeatured(limit: number = 8) {
    return this.prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED, deletedAt: null, isFeatured: true },
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        images: { orderBy: [{ isMain: 'desc' }, { displayOrder: 'asc' }], take: 2 },
        variants: { where: { isActive: true }, select: { price: true, compareAtPrice: true, stock: true } },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOffers(limit: number = 8) {
    return this.prisma.product.findMany({
      where: {
        status: ProductStatus.PUBLISHED,
        deletedAt: null,
        compareAtPrice: { not: null, gt: this.prisma.product.fields.basePrice },
      },
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        images: { orderBy: [{ isMain: 'desc' }, { displayOrder: 'asc' }], take: 2 },
        variants: { where: { isActive: true }, select: { price: true, compareAtPrice: true, stock: true } },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findNewArrivals(limit: number = 8) {
    return this.prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED, deletedAt: null, isNewArrival: true },
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
        images: { orderBy: [{ isMain: 'desc' }, { displayOrder: 'asc' }], take: 2 },
        variants: { where: { isActive: true }, select: { price: true, compareAtPrice: true, stock: true } },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================
  // ADMINISTRACIÓN DE PRODUCTOS
  // ==========================================

  async findAllAdmin(filter: ProductFilterDto) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      brandId,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          images: { orderBy: [{ isMain: 'desc' }, { displayOrder: 'asc' }] },
          variants: {
            select: { id: true, sku: true, title: true, stock: true, price: true, isActive: true },
          },
          _count: {
            select: { reviews: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: products,
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
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { displayOrder: 'asc' } },
        specifications: { orderBy: { displayOrder: 'asc' } },
        variants: {
          include: {
            _count: {
              select: { inventoryMovements: true, orderItems: true },
            },
          },
        },
      },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }

  async create(dto: CreateProductDto, userId?: string) {
    const slug = dto.slug
      ? slugify(dto.slug, { lower: true, strict: true })
      : slugify(dto.name, { lower: true, strict: true });

    // Verificar unicidad de slug y sku
    const existing = await this.prisma.product.findFirst({
      where: { OR: [{ slug }, { sku: dto.sku }] },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un producto con el SKU '${dto.sku}' o el slug '${slug}'`,
      );
    }

    // Validar existencia de categoría y marca
    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) {
      throw new BadRequestException(`Categoría con ID ${dto.categoryId} no existe`);
    }

    if (dto.brandId) {
      const brand = await this.prisma.brand.findUnique({ where: { id: dto.brandId } });
      if (!brand) {
        throw new BadRequestException(`Marca con ID ${dto.brandId} no existe`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: dto.name,
          slug,
          sku: dto.sku,
          shortDescription: dto.shortDescription,
          description: dto.description,
          basePrice: dto.basePrice,
          compareAtPrice: dto.compareAtPrice,
          costPrice: dto.costPrice,
          status: dto.status || ProductStatus.DRAFT,
          isFeatured: dto.isFeatured || false,
          isNewArrival: dto.isNewArrival || false,
          weight: dto.weight,
          length: dto.length,
          width: dto.width,
          height: dto.height,
          categoryId: dto.categoryId,
          brandId: dto.brandId,
          seoTitle: dto.seoTitle,
          seoDescription: dto.seoDescription,
          seoKeywords: dto.seoKeywords,
          images: dto.images && dto.images.length > 0 ? { create: dto.images } : undefined,
          specifications:
            dto.specifications && dto.specifications.length > 0
              ? { create: dto.specifications }
              : undefined,
        },
        include: {
          images: true,
          specifications: true,
          category: true,
          brand: true,
        },
      });

      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            action: 'CREATE_PRODUCT',
            entity: 'Product',
            entityId: product.id,
            newData: { name: product.name, sku: product.sku, basePrice: product.basePrice },
          },
        });
      }

      return product;
    });
  }

  async update(id: string, dto: UpdateProductDto, userId?: string) {
    const existing = await this.findOneAdmin(id);

    let slug: string | undefined;
    if (dto.slug || dto.name) {
      slug = dto.slug
        ? slugify(dto.slug, { lower: true, strict: true })
        : dto.name
        ? slugify(dto.name, { lower: true, strict: true })
        : undefined;

      if (slug) {
        const conflict = await this.prisma.product.findFirst({
          where: { slug, NOT: { id } },
        });
        if (conflict) {
          throw new ConflictException(`Ya existe otro producto con el slug '${slug}'`);
        }
      }
    }

    if (dto.sku) {
      const skuConflict = await this.prisma.product.findFirst({
        where: { sku: dto.sku, NOT: { id } },
      });
      if (skuConflict) {
        throw new ConflictException(`Ya existe otro producto con el SKU '${dto.sku}'`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Reemplazo de especificaciones si vienen en el payload
      if (dto.specifications) {
        await tx.productSpecification.deleteMany({ where: { productId: id } });
        await tx.productSpecification.createMany({
          data: dto.specifications.map((s) => ({ ...s, productId: id })),
        });
      }

      // Reemplazo de imágenes si vienen en el payload
      if (dto.images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: dto.images.map((img) => ({ ...img, productId: id })),
        });
      }

      const updated = await tx.product.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(slug && { slug }),
          ...(dto.sku && { sku: dto.sku }),
          ...(dto.shortDescription !== undefined && { shortDescription: dto.shortDescription }),
          ...(dto.description && { description: dto.description }),
          ...(dto.basePrice !== undefined && { basePrice: dto.basePrice }),
          ...(dto.compareAtPrice !== undefined && { compareAtPrice: dto.compareAtPrice }),
          ...(dto.costPrice !== undefined && { costPrice: dto.costPrice }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
          ...(dto.isNewArrival !== undefined && { isNewArrival: dto.isNewArrival }),
          ...(dto.weight !== undefined && { weight: dto.weight }),
          ...(dto.length !== undefined && { length: dto.length }),
          ...(dto.width !== undefined && { width: dto.width }),
          ...(dto.height !== undefined && { height: dto.height }),
          ...(dto.categoryId && { categoryId: dto.categoryId }),
          ...(dto.brandId !== undefined && { brandId: dto.brandId }),
          ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
          ...(dto.seoDescription !== undefined && { seoDescription: dto.seoDescription }),
          ...(dto.seoKeywords !== undefined && { seoKeywords: dto.seoKeywords }),
        },
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          specifications: { orderBy: { displayOrder: 'asc' } },
          category: true,
          brand: true,
          variants: true,
        },
      });

      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            action: 'UPDATE_PRODUCT',
            entity: 'Product',
            entityId: id,
            previousData: { basePrice: existing.basePrice, status: existing.status },
            newData: { basePrice: updated.basePrice, status: updated.status },
          },
        });
      }

      return updated;
    });
  }

  async duplicate(id: string, userId?: string) {
    const original = await this.findOneAdmin(id);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newName = `${original.name} (Copia)`;
    const newSlug = `${original.slug}-copia-${randomSuffix}`;
    const newSku = `${original.sku}-CPY-${randomSuffix}`;

    return this.prisma.$transaction(async (tx) => {
      const duplicatedProduct = await tx.product.create({
        data: {
          name: newName,
          slug: newSlug,
          sku: newSku,
          shortDescription: original.shortDescription,
          description: original.description,
          basePrice: original.basePrice,
          compareAtPrice: original.compareAtPrice,
          costPrice: original.costPrice,
          status: ProductStatus.DRAFT,
          isFeatured: false,
          isNewArrival: false,
          weight: original.weight,
          length: original.length,
          width: original.width,
          height: original.height,
          categoryId: original.categoryId,
          brandId: original.brandId,
          seoTitle: original.seoTitle,
          seoDescription: original.seoDescription,
          seoKeywords: original.seoKeywords,
          images: {
            create: original.images.map((img) => ({
              url: img.url,
              thumbnailUrl: img.thumbnailUrl,
              altText: img.altText,
              isMain: img.isMain,
              displayOrder: img.displayOrder,
            })),
          },
          specifications: {
            create: original.specifications.map((spec) => ({
              key: spec.key,
              value: spec.value,
              displayOrder: spec.displayOrder,
            })),
          },
        },
        include: {
          images: true,
          specifications: true,
        },
      });

      // Duplicar variantes
      for (const variant of original.variants) {
        await tx.productVariant.create({
          data: {
            productId: duplicatedProduct.id,
            sku: `${variant.sku}-CPY-${randomSuffix}`,
            title: variant.title,
            attributes: variant.attributes as any,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            costPrice: variant.costPrice,
            stock: 0, // Stock inicial en 0 para la copia
            weight: variant.weight,
            imageUrl: variant.imageUrl,
            isActive: variant.isActive,
          },
        });
      }

      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            action: 'DUPLICATE_PRODUCT',
            entity: 'Product',
            entityId: duplicatedProduct.id,
            newData: { originalId: original.id, duplicatedId: duplicatedProduct.id },
          },
        });
      }

      return duplicatedProduct;
    });
  }

  async toggleStatus(id: string, status: ProductStatus, userId?: string) {
    const product = await this.findOneAdmin(id);

    const updated = await this.prisma.product.update({
      where: { id },
      data: { status },
    });

    if (userId) {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'TOGGLE_PRODUCT_STATUS',
          entity: 'Product',
          entityId: id,
          previousData: { status: product.status },
          newData: { status: updated.status },
        },
      });
    }

    return updated;
  }

  async softDelete(id: string, userId?: string) {
    await this.findOneAdmin(id);

    const deleted = await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), status: ProductStatus.ARCHIVED },
    });

    if (userId) {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'SOFT_DELETE_PRODUCT',
          entity: 'Product',
          entityId: id,
        },
      });
    }

    return { message: 'Producto archivado y eliminado correctamente' };
  }
}
