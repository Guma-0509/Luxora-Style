import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CalculateCheckoutDto } from './dto/calculate-checkout.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cart & Checkout')
@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Public()
  @Get('cart')
  @ApiOperation({ summary: 'Obtener items del carrito (autenticado o por sessionId de invitado)' })
  @ApiQuery({ name: 'sessionId', required: false, type: String })
  async getCart(
    @CurrentUser() user?: AuthenticatedUser,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.cartService.getCart(user?.id, sessionId);
  }

  @Public()
  @Post('cart/items')
  @ApiOperation({ summary: 'Agregar un producto/variante al carrito' })
  async addItem(
    @Body() dto: AddToCartDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.cartService.addItem(dto, user?.id);
  }

  @Public()
  @Patch('cart/items/:itemId')
  @ApiOperation({ summary: 'Actualizar cantidad de un artículo en el carrito' })
  async updateItemQuantity(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.cartService.updateItemQuantity(itemId, dto, user?.id);
  }

  @Public()
  @Delete('cart/items/:itemId')
  @ApiOperation({ summary: 'Eliminar un artículo del carrito' })
  async removeItem(
    @Param('itemId') itemId: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.cartService.removeItem(itemId, user?.id);
  }

  @Public()
  @Delete('cart')
  @ApiOperation({ summary: 'Vaciar todos los artículos del carrito' })
  @ApiQuery({ name: 'sessionId', required: false, type: String })
  async clearCart(
    @CurrentUser() user?: AuthenticatedUser,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.cartService.clearCart(user?.id, sessionId);
  }

  @Public()
  @Post('checkout/calculate')
  @ApiOperation({ summary: 'Calcular desglose del checkout (subtotal, cupón, envío e impuestos)' })
  async calculateCheckout(
    @Body() dto: CalculateCheckoutDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.cartService.calculateCheckout(dto, user?.id);
  }
}
