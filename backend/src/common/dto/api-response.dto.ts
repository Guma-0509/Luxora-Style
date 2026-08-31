export interface ApiResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export class ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: ApiResponseMeta;

  static success<T>(data: T, message: string = 'Operación exitosa', meta?: ApiResponseMeta): ApiResponse<T> {
    const response = new ApiResponse<T>();
    response.success = true;
    response.statusCode = 200;
    response.message = message;
    response.data = data;
    if (meta) {
      response.meta = meta;
    }
    return response;
  }

  static created<T>(data: T, message: string = 'Recurso creado exitosamente'): ApiResponse<T> {
    const response = new ApiResponse<T>();
    response.success = true;
    response.statusCode = 201;
    response.message = message;
    response.data = data;
    return response;
  }
}
