import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import slugify from 'slugify';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(includeInactive: boolean = false) {
    return this.prisma.brand.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException(`Marca con ID ${id} no encontrada`);
    }

    return brand;
  }

  async findBySlug(slug: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException(`Marca con slug '${slug}' no encontrada`);
    }

    return brand;
  }

  async create(dto: CreateBrandDto) {
    const slug = dto.slug
      ? slugify(dto.slug, { lower: true, strict: true })
      : slugify(dto.name, { lower: true, strict: true });

    const existing = await this.prisma.brand.findFirst({
      where: { OR: [{ name: dto.name }, { slug }] },
    });

    if (existing) {
      throw new ConflictException(`Ya existe una marca con el nombre '${dto.name}' o slug '${slug}'`);
    }

    return this.prisma.brand.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        logoUrl: dto.logoUrl,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
  }

  async update(id: string, dto: UpdateBrandDto) {
    await this.findOne(id);

    let slug: string | undefined;
    if (dto.slug || dto.name) {
      slug = dto.slug
        ? slugify(dto.slug, { lower: true, strict: true })
        : dto.name
        ? slugify(dto.name, { lower: true, strict: true })
        : undefined;

      if (slug) {
        const existing = await this.prisma.brand.findFirst({
          where: { slug, NOT: { id } },
        });
        if (existing) {
          throw new ConflictException(`Ya existe otra marca con el slug '${slug}'`);
        }
      }
    }

    return this.prisma.brand.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(slug && { slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const productCount = await this.prisma.product.count({ where: { brandId: id } });
    if (productCount > 0) {
      throw new ConflictException(
        `No se puede eliminar la marca porque tiene ${productCount} producto(s) asignado(s).`,
      );
    }

    return this.prisma.brand.delete({
      where: { id },
    });
  }
}
