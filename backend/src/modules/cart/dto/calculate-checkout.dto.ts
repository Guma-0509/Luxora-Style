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

export class CheckoutItemDto {
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

export enum ShippingMethodOption {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
}

export class CalculateCheckoutDto {
  @ApiProperty({ type: [CheckoutItemDto], description: 'Items a calcular en el checkout' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @ApiPropertyOptional({ example: 'BIENVENIDO10', description: 'Código de cupón opcional' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({
    enum: ShippingMethodOption,
    default: ShippingMethodOption.STANDARD,
    description: 'Método de envío seleccionado',
  })
  @IsOptional()
  @IsEnum(ShippingMethodOption)
  shippingMethod?: ShippingMethodOption = ShippingMethodOption.STANDARD;
}
