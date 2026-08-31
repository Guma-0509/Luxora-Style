import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Catalog - Brands')
@Controller()
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  // ==========================================
  // ENDPOINTS PÚBLICOS
  // ==========================================

  @Public()
  @Get('brands')
  @ApiOperation({ summary: 'Listar marcas activas' })
  async getBrands() {
    return this.brandsService.findAll(false);
  }

  @Public()
  @Get('brands/slug/:slug')
  @ApiOperation({ summary: 'Obtener información de una marca por su slug' })
  async getBrandBySlug(@Param('slug') slug: string) {
    return this.brandsService.findBySlug(slug);
  }

  @Public()
  @Get('brands/:id')
  @ApiOperation({ summary: 'Obtener marca por ID' })
  async getBrandById(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  // ==========================================
  // ENDPOINTS ADMINISTRATIVOS
  // ==========================================

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('brands:read')
  @Get('admin/brands')
  @ApiOperation({ summary: 'Listar todas las marcas para administración' })
  async getAdminBrands() {
    return this.brandsService.findAll(true);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('brands:create')
  @Post('admin/brands')
  @ApiOperation({ summary: 'Crear una nueva marca' })
  async createBrand(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('brands:update')
  @Put('admin/brands/:id')
  @ApiOperation({ summary: 'Actualizar una marca' })
  async updateBrand(
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
  ) {
    return this.brandsService.update(id, dto);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('brands:delete')
  @Delete('admin/brands/:id')
  @ApiOperation({ summary: 'Eliminar una marca' })
  async deleteBrand(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}
