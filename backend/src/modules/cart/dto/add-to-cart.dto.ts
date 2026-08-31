import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ description: 'ID de la variante de producto a agregar' })
  @IsString()
  @IsNotEmpty({ message: 'El ID de la variante es requerido' })
  variantId: string;

  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Cantidad a agregar' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number = 1;

  @ApiPropertyOptional({ description: 'ID de sesión para carritos de invitados no autenticados' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
