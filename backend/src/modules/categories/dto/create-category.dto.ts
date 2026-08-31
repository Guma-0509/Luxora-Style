import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Celulares & Smartphones', description: 'Nombre de la categoría' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @ApiPropertyOptional({ example: 'celulares-smartphones', description: 'Slug único (se autogenera si se omite)' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Smartphones y teléfonos inteligentes de última generación', description: 'Descripción' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1511707171634.jpg', description: 'URL de imagen de la categoría' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'ID de la categoría padre (para subcategorías)', example: null })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ default: true, description: 'Estado activo/inactivo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({ default: 0, description: 'Orden de visualización' })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number = 0;
}
