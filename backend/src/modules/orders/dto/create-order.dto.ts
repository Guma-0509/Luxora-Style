import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class OrderItemInputDto {
  @ApiProperty({ description: 'ID de la variante de producto' })
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class ShippingAddressInputDto {
  @ApiProperty({ example: 'Carlos Mendoza' })
  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @ApiProperty({ example: '+18095550200' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Av. Winston Churchill #1099' })
  @IsString()
  @IsNotEmpty()
  streetAddress: string;

  @ApiPropertyOptional({ example: 'Apt 4B' })
  @IsOptional()
  @IsString()
  apartment?: string;

  @ApiProperty({ example: 'Santo Domingo' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Distrito Nacional' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '10148' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiPropertyOptional({ example: 'DO', default: 'DO' })
  @IsOptional()
  @IsString()
  country?: string = 'DO';
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemInputDto], description: 'Listado de artículos del pedido' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];

  @ApiPropertyOptional({ description: 'ID de una dirección ya registrada' })
  @IsOptional()
  @IsString()
  addressId?: string;

  @ApiPropertyOptional({ type: ShippingAddressInputDto, description: 'Nueva dirección de entrega' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressInputDto)
  shippingAddress?: ShippingAddressInputDto;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.STRIPE })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: 'BIENVENIDO10', description: 'Código de cupón de descuento' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ example: 'Dejar en recepción del edificio', description: 'Instrucciones de entrega' })
  @IsOptional()
  @IsString()
  notes?: string;
}
