import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class InventoryFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'ID de producto específico' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: 'ID de categoría' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'ID de marca' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Umbral para considerar stock bajo', default: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lowStockThreshold?: number = 5;

  @ApiPropertyOptional({ description: 'Filtrar únicamente variantes agotadas (stock = 0)' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  outOfStockOnly?: boolean;

  @ApiPropertyOptional({ description: 'Filtrar únicamente variantes con stock bajo' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  lowStockOnly?: boolean;
}
