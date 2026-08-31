import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Carlos', description: 'Nombre' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Mendoza', description: 'Apellido' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+18095550200', description: 'Teléfono' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/avatar.jpg', description: 'URL del avatar' })
  @IsOptional()
  @IsUrl({}, { message: 'La URL del avatar debe ser válida' })
  avatarUrl?: string;
}
