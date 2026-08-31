import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ValidateCouponDto {
  @ApiProperty({ example: 'BIENVENIDO10', description: 'Código del cupón a validar' })
  @IsString()
  @IsNotEmpty({ message: 'El código del cupón es requerido' })
  code: string;

  @ApiProperty({ example: 120.0, description: 'Subtotal actual del carrito' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  subtotal: number;
}
