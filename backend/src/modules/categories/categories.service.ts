import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllTree(includeInactive: boolean = false) {
    const whereClause: any = { parentId: null };
    if (!includeInactive) {
      whereClause.isActive = true;
    }

    return this.prisma.category.findMany({
      where: whereClause,
      include: {
        subcategories: {
          where: includeInactive ? {} : { isActive: true },
          include: {
            subcategories: {
              where: includeInactive ? {} : { isActive: true },
            },
            _count: {
              select: { products: true },
            },
          },
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findAllFlat(includeInactive: boolean = false) {
    return this.prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { products: true, subcategories: true },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        subcategories: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        subcategories: {
          where: { isActive: true },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Categoría con slug '${slug}' no encontrada`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug
      ? slugify(dto.slug, { lower: true, strict: true })
      : slugify(dto.name, { lower: true, strict: true });

    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Ya existe una categoría con el slug '${slug}'`);
    }

    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parent) {
        throw new NotFoundException(`Categoría padre con ID ${dto.parentId} no encontrada`);
      }
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        parentId: dto.parentId || null,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        displayOrder: dto.displayOrder || 0,
      },
      include: { parent: true },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    let slug: string | undefined;
    if (dto.slug || dto.name) {
      slug = dto.slug
        ? slugify(dto.slug, { lower: true, strict: true })
        : dto.name
        ? slugify(dto.name, { lower: true, strict: true })
        : undefined;

      if (slug) {
        const existing = await this.prisma.category.findFirst({
          where: { slug, NOT: { id } },
        });
        if (existing) {
          throw new ConflictException(`Ya existe otra categoría con el slug '${slug}'`);
        }
      }
    }

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new ConflictException('Una categoría no puede ser su propio padre');
      }
      const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId } });
      if (!parent) {
        throw new NotFoundException(`Categoría padre con ID ${dto.parentId} no encontrada`);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(slug && { slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
      },
      include: { parent: true, subcategories: true },
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    const productCount = await this.prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new ConflictException(
        `No se puede eliminar la categoría porque tiene ${productCount} producto(s) asignado(s). Reasigna los productos primero.`,
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
