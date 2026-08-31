import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class ProductImageDto {
  @ApiProperty({ example: 'https://images.unsplash.com/photo-product.jpg', description: 'URL de la imagen' })
  @IsString()
  @IsNotEmpty({ message: 'La URL de la imagen es requerida' })
  url: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-thumb.jpg', description: 'Thumbnail' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 'Vista frontal del producto', description: 'Texto alternativo' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ default: false, description: 'Es la imagen principal' })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean = false;

  @ApiPropertyOptional({ default: 0, description: 'Orden de visualización' })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number = 0;
}
