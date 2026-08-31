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
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Coupons & Discounts')
@Controller()
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Public()
  @Post('coupons/validate')
  @ApiOperation({ summary: 'Validar cupón de descuento para el carrito o checkout' })
  async validateCoupon(
    @Body() dto: ValidateCouponDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.couponsService.validateCoupon(dto, user?.id);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('coupons:read')
  @Get('admin/coupons')
  @ApiOperation({ summary: 'Listar todos los cupones para el panel de administración' })
  async getAdminCoupons() {
    return this.couponsService.findAll();
  }

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('coupons:create')
  @Post('admin/coupons')
  @ApiOperation({ summary: 'Crear un nuevo cupón de descuento' })
  async createCoupon(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('coupons:update')
  @Put('admin/coupons/:id')
  @ApiOperation({ summary: 'Actualizar un cupón existente' })
  async updateCoupon(
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.couponsService.update(id, dto);
  }

  @ApiBearerAuth('JWT-auth')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @RequirePermissions('coupons:delete')
  @Delete('admin/coupons/:id')
  @ApiOperation({ summary: 'Eliminar un cupón' })
  async deleteCoupon(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
