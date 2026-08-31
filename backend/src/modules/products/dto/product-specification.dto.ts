import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class ProductSpecificationDto {
  @ApiProperty({ example: 'Material', description: 'Nombre de la especificación' })
  @IsString()
  @IsNotEmpty({ message: 'La clave de especificación es requerida' })
  key: string;

  @ApiProperty({ example: '100% Algodón Peinado', description: 'Valor de la especificación' })
  @IsString()
  @IsNotEmpty({ message: 'El valor de la especificación es requerido' })
  value: string;

  @ApiPropertyOptional({ default: 0, description: 'Orden de visualización' })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number = 0;
}
