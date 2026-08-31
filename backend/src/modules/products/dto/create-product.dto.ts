import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductStatus } from '@prisma/client';
import { ProductSpecificationDto } from './product-specification.dto';
import { ProductImageDto } from './product-image.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro Max', description: 'Nombre del producto' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del producto es requerido' })
  name: string;

  @ApiPropertyOptional({ example: 'iphone-15-pro-max', description: 'Slug único (se autogenera si se omite)' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'APL-IPH15PM-001', description: 'SKU base del producto' })
  @IsString()
  @IsNotEmpty({ message: 'El SKU es requerido' })
  sku: string;

  @ApiPropertyOptional({ example: 'Diseño en titanio con chip A17 Pro', description: 'Descripción corta' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ example: 'Descripción detallada y completa del producto...', description: 'Descripción completa' })
  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  description: string;

  @ApiProperty({ example: 1199.99, description: 'Precio base del producto' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiPropertyOptional({ example: 1299.99, description: 'Precio de comparación anterior' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 900.0, description: 'Costo interno del producto' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus = ProductStatus.DRAFT;

  @ApiPropertyOptional({ default: false, description: 'Destacado en portada' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @ApiPropertyOptional({ default: false, description: 'Producto nuevo' })
  @IsOptional()
  @IsBoolean()
  isNewArrival?: boolean = false;

  @ApiPropertyOptional({ example: 0.221, description: 'Peso en kg' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 15.99, description: 'Largo en cm' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  length?: number;

  @ApiPropertyOptional({ example: 7.67, description: 'Ancho en cm' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  width?: number;

  @ApiPropertyOptional({ example: 0.82, description: 'Alto en cm' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  height?: number;

  @ApiProperty({ description: 'ID de la categoría a la que pertenece' })
  @IsString()
  @IsNotEmpty({ message: 'La categoría es requerida' })
  categoryId: string;

  @ApiPropertyOptional({ description: 'ID de la marca' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ type: [ProductImageDto], description: 'Imágenes del producto' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @ApiPropertyOptional({ type: [ProductSpecificationDto], description: 'Especificaciones dinámicas' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSpecificationDto)
  specifications?: ProductSpecificationDto[];

  @ApiPropertyOptional({ description: 'Título optimizado para SEO' })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'Descripción optimizada para motores de búsqueda' })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ description: 'Palabras clave separadas por comas' })
  @IsOptional()
  @IsString()
  seoKeywords?: string;
}
