import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.PROCESSING })
  @IsEnum(OrderStatus)
  @IsNotEmpty({ message: 'El estado es requerido' })
  status: OrderStatus;

  @ApiPropertyOptional({ example: 'TRK-98421095', description: 'Número de guía de despacho' })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({ example: 'FedEx Express', description: 'Compañía de envíos' })
  @IsOptional()
  @IsString()
  carrier?: string;

  @ApiPropertyOptional({ example: 'Pedido preparado y entregado al transportista', description: 'Nota de cambio de estado' })
  @IsOptional()
  @IsString()
  note?: string;
}
