import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ProductStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ProductFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filtrar por slug de categoría' })
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID de categoría' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por slug de marca' })
  @IsOptional()
  @IsString()
  brandSlug?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ID de marca' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Precio mínimo' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Precio máximo' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: ProductStatus, description: 'Estado del producto (solo administradores)' })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ description: 'Solo productos destacados' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Solo productos nuevos' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isNewArrival?: boolean;

  @ApiPropertyOptional({ description: 'Solo productos con stock disponible' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStockOnly?: boolean;

  @ApiPropertyOptional({ description: 'Calificación mínima (1 a 5)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  minRating?: number;
}
