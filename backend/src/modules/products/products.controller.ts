import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ProductStatus } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Catalog - Products')
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ==========================================
  // ENDPOINTS PÚBLICOS (STOREFRONT)
  // ==========================================

  @Public()
  @Get('products')
  @ApiOperation({ summary: 'Explorar catálogo con búsqueda textual, filtros facetados y paginación' })
  async getPublicProducts(@Query() filterDto: ProductFilterDto) {
    return this.productsService.findAllPublic(filterDto);
  }

  @Public()
  @Get('products/featured')
  @ApiOperation({ summary: 'Obtener productos destacados para el Home' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeaturedProducts(@Query('limit') limit?: number) {
    return this.productsService.findFeatured(limit ? Number(limit) : 8);
  }

  @Public()
  @Get('products/offers')
  @ApiOperation({ summary: 'Obtener productos en oferta con precio de descuento' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getOfferProducts(@Query('limit') limit?: number) {
    return this.productsService.findOffers(limit ? Number(limit) : 8);
  }

  @Public()
  @Get('products/new-arrivals')
  @ApiOperation({ summary: 'Obtener novedades y productos recién ingresados' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getNewArrivalProducts(@Query('limit') limit?: number) {
    return this.productsService.findNewArrivals(limit ? Number(limit) : 8);
  }

  @Public()
  @Get('products/slug/:slug')
  @ApiOperation({ summary: 'Obtener detalle completo de un producto por su slug' })
  async getProductBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  // ==========================================
  // ENDPOINTS ADMINISTRATIVOS (ADMIN PANEL)
  // ==========================================

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('products:read')
  @Get('admin/products')
  @ApiOperation({ summary: 'Listado completo de productos para el panel de administración' })
  async getAdminProducts(@Query() filterDto: ProductFilterDto) {
    return this.productsService.findAllAdmin(filterDto);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('products:read')
  @Get('admin/products/:id')
  @ApiOperation({ summary: 'Obtener detalle de un producto para edición' })
  async getAdminProductById(@Param('id') id: string) {
    return this.productsService.findOneAdmin(id);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('products:create')
  @Post('admin/products')
  @ApiOperation({ summary: 'Crear un nuevo producto con imágenes y especificaciones' })
  async createProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(dto, user.id);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('products:update')
  @Put('admin/products/:id')
  @ApiOperation({ summary: 'Actualizar un producto existente' })
  async updateProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto, user.id);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('products:create')
  @Post('admin/products/:id/duplicate')
  @ApiOperation({ summary: 'Duplicar un producto existente con sus variantes' })
  async duplicateProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.productsService.duplicate(id, user.id);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('products:update')
  @Patch('admin/products/:id/status')
  @ApiOperation({ summary: 'Cambiar el estado de publicación del producto (DRAFT, PUBLISHED, ARCHIVED)' })
  async toggleProductStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body('status') status: ProductStatus,
  ) {
    return this.productsService.toggleStatus(id, status, user.id);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('products:delete')
  @Delete('admin/products/:id')
  @ApiOperation({ summary: 'Eliminar (Soft Delete) un producto' })
  async deleteProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.productsService.softDelete(id, user.id);
  }
}
