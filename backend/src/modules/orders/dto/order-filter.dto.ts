import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class OrderFilterDto extends PaginationDto {
  @ApiPropertyOptional({ enum: OrderStatus, description: 'Filtrar por estado del pedido' })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ enum: PaymentStatus, description: 'Filtrar por estado del pago' })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ description: 'Filtrar por ID de usuario' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Fecha de inicio (ISO)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Fecha de fin (ISO)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}
