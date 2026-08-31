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
import { InventoryService } from './inventory.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { InventoryFilterDto } from './dto/inventory-filter.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Inventory & Warehouse')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @RequirePermissions('inventory:read')
  @Get()
  @ApiOperation({ summary: 'Consultar estado general de inventario, stock por variantes y KPIs de almacén' })
  async getInventoryStatus(@Query() filterDto: InventoryFilterDto) {
    return this.inventoryService.getInventoryStatus(filterDto);
  }

  @RequirePermissions('inventory:read')
  @Get('movements/:variantId')
  @ApiOperation({ summary: 'Consultar historial de movimientos y auditoría de una variante' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getVariantMovements(
    @Param('variantId') variantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.inventoryService.getVariantMovements(variantId, page ? Number(page) : 1, limit ? Number(limit) : 20);
  }

  @RequirePermissions('inventory:create')
  @Post('variants')
  @ApiOperation({ summary: 'Crear una nueva variante para un producto existente' })
  async createVariant(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateVariantDto,
  ) {
    return this.inventoryService.createVariant(dto, user.id);
  }

  @RequirePermissions('inventory:update')
  @Put('variants/:id')
  @ApiOperation({ summary: 'Actualizar precios, SKU o atributos de una variante' })
  async updateVariant(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.inventoryService.updateVariant(id, dto, user.id);
  }

  @RequirePermissions('inventory:delete')
  @Delete('variants/:id')
  @ApiOperation({ summary: 'Eliminar o desactivar una variante' })
  async deleteVariant(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.inventoryService.deleteVariant(id, user.id);
  }

  @RequirePermissions('inventory:adjust')
  @Post('adjust')
  @ApiOperation({ summary: 'Realizar un ajuste de stock transaccional con registro obligatorio de movimiento' })
  async adjustStock(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AdjustStockDto,
  ) {
    return this.inventoryService.adjustStock(dto, user.id);
  }
}
