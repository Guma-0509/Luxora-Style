import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log(' Conexión establecida con la base de datos PostgreSQL.');
    } catch (error) {
      this.logger.error(' Error conectando con la base de datos PostgreSQL:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log(' Desconexión limpia de Prisma.');
  }
}
