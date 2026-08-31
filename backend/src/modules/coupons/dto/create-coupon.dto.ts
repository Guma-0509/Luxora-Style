import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CouponType } from '@prisma/client';

export class CreateCouponDto {
  @ApiProperty({ example: 'BIENVENIDO10', description: 'Código único del cupón en mayúsculas' })
  @IsString()
  @IsNotEmpty({ message: 'El código del cupón es requerido' })
  code: string;

  @ApiPropertyOptional({ example: '10% de descuento en tu primera orden', description: 'Descripción' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CouponType, example: CouponType.PERCENTAGE, default: CouponType.PERCENTAGE })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ example: 10.0, description: 'Valor del descuento (% o monto fijo en USD)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ example: 50.0, description: 'Monto mínimo de compra requerido' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minSpend?: number;

  @ApiPropertyOptional({ example: 100.0, description: 'Descuento máximo aplicable' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ example: 1000, description: 'Límite global de usos' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxUsageTotal?: number;

  @ApiPropertyOptional({ example: 1, default: 1, description: 'Límite de usos por usuario' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxUsagePerUser?: number = 1;

  @ApiProperty({ example: '2026-01-01T00:00:00Z', description: 'Fecha de inicio de vigencia' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ example: '2027-12-31T23:59:59Z', description: 'Fecha de expiración' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiPropertyOptional({ default: true, description: 'Estado del cupón' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
