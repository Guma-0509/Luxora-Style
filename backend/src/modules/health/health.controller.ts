import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health & Monitoring')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Verificar estado y disponibilidad de los servicios del backend y base de datos' })
  @SwaggerApiResponse({ status: 200, description: 'Servicios en óptimo funcionamiento' })
  async checkHealth() {
    const startTime = Date.now();
    let dbStatus = 'UP';
    let dbLatencyMs = 0;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - startTime;
    } catch (error) {
      dbStatus = 'DOWN';
    }

    return {
      status: dbStatus === 'UP' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      services: {
        api: 'UP',
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
      },
    };
  }
}
