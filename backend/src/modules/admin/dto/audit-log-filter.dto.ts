import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class AuditLogFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filtrar por acción (ej. CREATE_PRODUCT, STOCK_ADJUSTMENT)' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ description: 'Filtrar por entidad (ej. Product, Order, User)' })
  @IsOptional()
  @IsString()
  entity?: string;

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
