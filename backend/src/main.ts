import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 4000;
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
  const corsOrigin = configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000';

  // 1. Seguridad con Helmet
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 2. Middlewares de utilidad
  app.use(cookieParser());
  app.use(compression());

  // 3. Configuración de CORS
  app.enableCors({
    origin: corsOrigin.includes(',') ? corsOrigin.split(',') : corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  // 4. Prefijo Global para la API
  app.setGlobalPrefix(apiPrefix);

  // 5. Pipes de Validación Globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 6. Filtros Globales de Excepción
  app.useGlobalFilters(new AllExceptionsFilter(), new PrismaClientExceptionFilter());

  // 7. Interceptores Globales
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformResponseInterceptor());

  // 8. Documentación Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Wally E-Commerce Enterprise API')
    .setDescription(
      'Documentación interactiva de la API REST para la plataforma de comercio electrónico Wally. Incluye autenticación JWT, RBAC granular, catálogo de productos con variantes, inventario transaccional, carrito, checkout, órdenes y panel de administración.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Introduce tu token JWT de acceso',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Health & Monitoring', 'Endpoints para verificar la salud y latencia del sistema')
    .addTag('Auth & Security', 'Registro, login de clientes, login de administradores y tokens')
    .addTag('Users & Addresses', 'Gestión de cuentas de usuarios y libretas de direcciones')
    .addTag('Catalog - Products', 'Catálogo de productos, filtros y especificaciones')
    .addTag('Catalog - Categories', 'Árbol jerárquico de categorías y navegación')
    .addTag('Catalog - Brands', 'Marcas y fabricantes')
    .addTag('Inventory & Warehouse', 'Control de stock y movimientos transaccionales')
    .addTag('Cart & Checkout', 'Carrito de compras persistente y cálculo de pedidos')
    .addTag('Orders & Tracking', 'Gestión del ciclo de vida de órdenes y despachos')
    .addTag('Admin & Metrics', 'Analítica de ventas, reportes y métricas en tiempo real')
    .addTag('Audit Logs', 'Trazabilidad y auditoría de acciones administrativas')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
    },
    customSiteTitle: 'Wally API Docs | Enterprise E-Commerce',
  });

  // 9. Iniciar Servidor
  await app.listen(port);
  logger.log(` Servidor Backend ejecutándose en: http://localhost:${port}`);
  logger.log(` Documentación Swagger disponible en: http://localhost:${port}/api/docs`);
  logger.log(` Endpoint de salud disponible en: http://localhost:${port}/${apiPrefix}/health`);
}

bootstrap();
