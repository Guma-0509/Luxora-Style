import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error en la base de datos';
    let error = 'DatabaseError';

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[])?.join(', ') || 'campo único';
        message = `Ya existe un registro con el mismo valor en: ${target}`;
        error = 'Conflict';
        break;
      }
      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        message = (exception.meta?.cause as string) || 'El registro solicitado no fue encontrado';
        error = 'NotFound';
        break;
      }
      case 'P2003': {
        status = HttpStatus.BAD_REQUEST;
        const fieldName = (exception.meta?.field_name as string) || 'relación referencial';
        message = `Violación de integridad referencial en: ${fieldName}`;
        error = 'BadRequest';
        break;
      }
      default:
        this.logger.error(`Prisma error unhandled [${exception.code}]: ${exception.message}`);
        break;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error,
      message: [message],
      prismaCode: exception.code,
      timestamp: new Date().toISOString(),
    });
  }
}
