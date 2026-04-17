import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  isError: boolean;
  statusCode: number;
  message: string | undefined;
  data: T;
  requestId: string;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode || 200;

        return {
          isError: false,
          statusCode,
          message: undefined,
          data,
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
