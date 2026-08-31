import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateVariantDto {
  @ApiProperty({ description: 'ID del producto padre' })
  @IsString()
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  productId: string;

  @ApiProperty({ example: 'TSHIRT-BLK-XL', description: 'SKU único de la variante' })
  @IsString()
  @IsNotEmpty({ message: 'El SKU de la variante es requerido' })
  sku: string;

  @ApiProperty({ example: 'Negro / XL', description: 'Título descriptivo de la variante' })
  @IsString()
  @IsNotEmpty({ message: 'El título de la variante es requerido' })
  title: string;

  @ApiProperty({
    example: { color: 'Negro', talla: 'XL' },
    description: 'Atributos combinados en formato objeto JSON',
  })
  @IsObject({ message: 'Los atributos deben ser un objeto clave-valor válido' })
  attributes: Record<string, any>;

  @ApiProperty({ example: 34.99, description: 'Precio específico de la variante' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 45.0, description: 'Precio anterior o de comparación' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 12.0, description: 'Costo de adquisición de la variante' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ example: 20, default: 0, description: 'Stock inicial' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock?: number = 0;

  @ApiPropertyOptional({ example: 0.25, description: 'Peso específico de la variante en kg' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/variant.jpg', description: 'URL de imagen de la variante' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ default: true, description: 'Estado activo de la variante' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
