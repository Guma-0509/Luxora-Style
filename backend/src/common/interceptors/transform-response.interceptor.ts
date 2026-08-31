import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  meta?: any;
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((resData) => {
        // If data is already in standardized ApiResponse format, return as is
        if (resData && typeof resData === 'object' && 'success' in resData && 'statusCode' in resData) {
          return resData;
        }

        // If response has meta (pagination) separated
        if (resData && typeof resData === 'object' && 'data' in resData && 'meta' in resData) {
          return {
            success: true,
            statusCode,
            message: resData.message || 'Operación exitosa',
            data: resData.data,
            meta: resData.meta,
          };
        }

        return {
          success: true,
          statusCode,
          message: 'Operación exitosa',
          data: resData !== undefined ? resData : null,
        };
      }),
    );
  }
}
