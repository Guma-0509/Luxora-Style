import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Catalog - Categories')
@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ==========================================
  // ENDPOINTS PÚBLICOS
  // ==========================================

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Obtener árbol jerárquico de categorías activas para navegación' })
  async getCategoryTree() {
    return this.categoriesService.findAllTree(false);
  }

  @Public()
  @Get('categories/slug/:slug')
  @ApiOperation({ summary: 'Obtener información de una categoría por su slug' })
  async getCategoryBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Public()
  @Get('categories/:id')
  @ApiOperation({ summary: 'Obtener información de una categoría por su ID' })
  async getCategoryById(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  // ==========================================
  // ENDPOINTS ADMINISTRATIVOS
  // ==========================================

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('categories:read')
  @Get('admin/categories')
  @ApiOperation({ summary: 'Listar todas las categorías (activas e inactivas) para el panel admin' })
  @ApiQuery({ name: 'tree', required: false, type: Boolean })
  async getAdminCategories(@Query('tree') tree?: boolean) {
    if (tree) {
      return this.categoriesService.findAllTree(true);
    }
    return this.categoriesService.findAllFlat(true);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('categories:create')
  @Post('admin/categories')
  @ApiOperation({ summary: 'Crear una nueva categoría o subcategoría' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('categories:update')
  @Put('admin/categories/:id')
  @ApiOperation({ summary: 'Actualizar una categoría existente' })
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('categories:delete')
  @Delete('admin/categories/:id')
  @ApiOperation({ summary: 'Eliminar una categoría (si no tiene productos asociados)' })
  async deleteCategory(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
