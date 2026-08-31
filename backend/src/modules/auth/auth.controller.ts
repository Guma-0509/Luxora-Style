import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse as SwaggerApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth & Security')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar una nueva cuenta de cliente' })
  @SwaggerApiResponse({ status: 201, description: 'Usuario registrado exitosamente', type: AuthResponseDto })
  async register(@Body() dto: RegisterDto, @Req() req: Request): Promise<AuthResponseDto> {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');
    return this.authService.register(dto, ipAddress, userAgent);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicio de sesión para clientes' })
  @SwaggerApiResponse({ status: 200, description: 'Inicio de sesión exitoso', type: AuthResponseDto })
  async login(@Body() dto: LoginDto, @Req() req: Request): Promise<AuthResponseDto> {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');
    return this.authService.login(dto, ipAddress, userAgent);
  }

  @Public()
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicio de sesión exclusivo para administradores (/admin/login)' })
  @SwaggerApiResponse({ status: 200, description: 'Acceso administrativo concedido', type: AuthResponseDto })
  async adminLogin(@Body() dto: AdminLoginDto, @Req() req: Request): Promise<AuthResponseDto> {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');
    return this.authService.adminLogin(dto, ipAddress, userAgent);
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar Access Token utilizando un Refresh Token válido' })
  async refreshToken(@Req() req: any) {
    const userId = req.user.userId;
    const refreshToken = req.user.refreshToken;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');
    return this.authService.refreshTokens(userId, refreshToken, ipAddress, userAgent);
  }

  @ApiBearerAuth('JWT-auth')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión y revocar tokens de actualización' })
  async logout(@CurrentUser() user: AuthenticatedUser) {
    await this.authService.logout(user.id);
    return { message: 'Sesión cerrada exitosamente' };
  }

  @ApiBearerAuth('JWT-auth')
  @Get('me')
  @ApiOperation({ summary: 'Obtener datos y permisos del usuario autenticado actual' })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user.id);
  }

  @ApiBearerAuth('JWT-auth')
  @Patch('profile')
  @ApiOperation({ summary: 'Actualizar información del perfil del usuario' })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, dto);
  }

  @ApiBearerAuth('JWT-auth')
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contraseña de acceso' })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(user.id, dto);
    return { message: 'Contraseña actualizada correctamente' };
  }
}
