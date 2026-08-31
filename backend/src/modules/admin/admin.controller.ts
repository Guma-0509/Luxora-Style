import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Admin & Metrics')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @RequirePermissions('audit:read')
  @Get('metrics/overview')
  @ApiOperation({ summary: 'Obtener métricas y KPIs clave de ventas, inventario y clientes' })
  async getOverviewMetrics() {
    return this.adminService.getOverviewMetrics();
  }

  @RequirePermissions('audit:read')
  @Get('metrics/sales-chart')
  @ApiOperation({ summary: 'Obtener serie temporal de ventas diarias para gráficas' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getSalesChart(@Query('days') days?: number) {
    return this.adminService.getSalesChart(days ? Number(days) : 7);
  }

  @RequirePermissions('audit:read')
  @Get('metrics/top-products')
  @ApiOperation({ summary: 'Obtener top de productos más vendidos' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopSellingProducts(@Query('limit') limit?: number) {
    return this.adminService.getTopSellingProducts(limit ? Number(limit) : 5);
  }

  @RequirePermissions('orders:read')
  @Get('metrics/recent-orders')
  @ApiOperation({ summary: 'Obtener lista de pedidos recientes para el dashboard' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentOrders(@Query('limit') limit?: number) {
    return this.adminService.getRecentOrders(limit ? Number(limit) : 6);
  }

  @RequirePermissions('audit:read')
  @Get('audit-logs')
  @ApiOperation({ summary: 'Consultar registro de auditoría de acciones administrativas' })
  async getAuditLogs(@Query() filterDto: AuditLogFilterDto) {
    return this.adminService.getAuditLogs(filterDto);
  }
}
