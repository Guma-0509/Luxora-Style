import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, NotEquals } from 'class-validator';
import { MovementType } from '@prisma/client';

export class AdjustStockDto {
  @ApiProperty({ description: 'ID de la variante del producto a modificar' })
  @IsString()
  @IsNotEmpty({ message: 'El ID de la variante es requerido' })
  variantId: string;

  @ApiProperty({
    example: 10,
    description:
      'Cantidad a modificar. Valor positivo para entradas (ej. +10 compra), valor negativo para salidas (ej. -2 merma/dañado)',
  })
  @Type(() => Number)
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @NotEquals(0, { message: 'La cantidad modificada no puede ser 0' })
  quantityModified: number;

  @ApiProperty({
    enum: MovementType,
    example: MovementType.RESTOCK,
    description: 'Tipo de movimiento de inventario',
  })
  @IsEnum(MovementType, { message: 'Tipo de movimiento no válido' })
  type: MovementType;

  @ApiPropertyOptional({
    example: 'Recepción de mercadería de proveedor - Factura #4920',
    description: 'Motivo o justificación del movimiento',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
