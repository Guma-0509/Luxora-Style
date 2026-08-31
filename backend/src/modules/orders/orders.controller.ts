import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderFilterDto } from './dto/order-filter.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Orders & Tracking')
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ==========================================
  // CLIENTE (STOREFRONT)
  // ==========================================

  @ApiBearerAuth('JWT-auth')
  @Post('orders')
  @ApiOperation({ summary: 'Crear un nuevo pedido con reserva atómica de inventario' })
  async createOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(dto, user.id);
  }

  @ApiBearerAuth('JWT-auth')
  @Get('orders/my-orders')
  @ApiOperation({ summary: 'Consultar el historial de pedidos del cliente autenticado' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ordersService.getMyOrders(user.id, page ? Number(page) : 1, limit ? Number(limit) : 10);
  }

  @ApiBearerAuth('JWT-auth')
  @Get('orders/my-orders/:id')
  @ApiOperation({ summary: 'Obtener detalle completo y seguimiento de un pedido del cliente' })
  async getMyOrderById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.ordersService.getMyOrderById(id, user.id);
  }

  // ==========================================
  // ADMINISTRACIÓN (ADMIN PANEL)
  // ==========================================

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('orders:read')
  @Get('admin/orders')
  @ApiOperation({ summary: 'Listar todos los pedidos con filtros y paginación para administradores' })
  async getAdminOrders(@Query() filterDto: OrderFilterDto) {
    return this.ordersService.findAllAdmin(filterDto);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('orders:read')
  @Get('admin/orders/:id')
  @ApiOperation({ summary: 'Consultar detalle operativo de un pedido' })
  async getAdminOrderById(@Param('id') id: string) {
    return this.ordersService.findOneAdmin(id);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('orders:update')
  @Patch('admin/orders/:id/status')
  @ApiOperation({
    summary:
      'Actualizar estado del pedido (PENDING -> PAID -> PROCESSING -> SHIPPED -> DELIVERED / CANCELLED)',
  })
  async updateOrderStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto, user.id);
  }
}
