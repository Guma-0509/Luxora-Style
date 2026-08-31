import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { CouponType } from '@prisma/client';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async validateCoupon(dto: ValidateCouponDto, userId?: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: dto.code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      throw new BadRequestException('El cupón ingresado no es válido o ha sido desactivado');
    }

    const now = new Date();
    if (now < coupon.startDate) {
      throw new BadRequestException('El cupón aún no se encuentra vigente');
    }

    if (now > coupon.endDate) {
      throw new BadRequestException('El cupón ha expirado');
    }

    if (coupon.maxUsageTotal && coupon.currentUsageCount >= coupon.maxUsageTotal) {
      throw new BadRequestException('El cupón ha alcanzado el límite máximo de usos disponibles');
    }

    if (coupon.minSpend && dto.subtotal < Number(coupon.minSpend)) {
      throw new BadRequestException(
        `Este cupón requiere un monto mínimo de compra de $${coupon.minSpend}. Tu subtotal actual es de $${dto.subtotal}`,
      );
    }

    // Verificar usos previos por el usuario si está autenticado
    if (userId && coupon.maxUsagePerUser) {
      const userOrdersCount = await this.prisma.order.count({
        where: {
          userId,
          couponCode: coupon.code,
          status: { notIn: ['CANCELLED', 'REFUNDED'] },
        },
      });

      if (userOrdersCount >= coupon.maxUsagePerUser) {
        throw new BadRequestException(
          `Ya has utilizado este cupón el número máximo de veces permitidas (${coupon.maxUsagePerUser})`,
        );
      }
    }

    // Calcular monto exacto de descuento
    let discountAmount = 0;
    if (coupon.type === CouponType.PERCENTAGE) {
      discountAmount = (dto.subtotal * Number(coupon.value)) / 100;
      if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount);
      }
    } else {
      discountAmount = Number(coupon.value);
    }

    // No exceder el subtotal
    discountAmount = Math.min(discountAmount, dto.subtotal);

    return {
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      discountAmount: Number(discountAmount.toFixed(2)),
      description: coupon.description,
      minSpend: coupon.minSpend ? Number(coupon.minSpend) : null,
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
    };
  }

  async findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Cupón con ID ${id} no encontrado`);
    }
    return coupon;
  }

  async create(dto: CreateCouponDto) {
    const code = dto.code.toUpperCase().trim();
    const existing = await this.prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      throw new ConflictException(`Ya existe un cupón con el código '${code}'`);
    }

    return this.prisma.coupon.create({
      data: {
        code,
        description: dto.description,
        type: dto.type,
        value: dto.value,
        minSpend: dto.minSpend,
        maxDiscount: dto.maxDiscount,
        maxUsageTotal: dto.maxUsageTotal,
        maxUsagePerUser: dto.maxUsagePerUser,
        startDate: dto.startDate,
        endDate: dto.endDate,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
  }

  async update(id: string, dto: UpdateCouponDto) {
    await this.findOne(id);

    let code: string | undefined;
    if (dto.code) {
      code = dto.code.toUpperCase().trim();
      const conflict = await this.prisma.coupon.findFirst({
        where: { code, NOT: { id } },
      });
      if (conflict) {
        throw new ConflictException(`Ya existe otro cupón con el código '${code}'`);
      }
    }

    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.type && { type: dto.type }),
        ...(dto.value !== undefined && { value: dto.value }),
        ...(dto.minSpend !== undefined && { minSpend: dto.minSpend }),
        ...(dto.maxDiscount !== undefined && { maxDiscount: dto.maxDiscount }),
        ...(dto.maxUsageTotal !== undefined && { maxUsageTotal: dto.maxUsageTotal }),
        ...(dto.maxUsagePerUser !== undefined && { maxUsagePerUser: dto.maxUsagePerUser }),
        ...(dto.startDate && { startDate: dto.startDate }),
        ...(dto.endDate && { endDate: dto.endDate }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.coupon.delete({ where: { id } });
  }
}
