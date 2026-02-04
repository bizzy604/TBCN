import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Standard API response structure
 */
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, any>;
  timestamp: string;
}

/**
 * Transform Interceptor
 * Wraps all successful responses in a consistent structure
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already in the correct format, return as-is
        if (data && typeof data === 'object' && 'data' in data && 'timestamp' in data) {
          return data;
        }

        // Handle paginated responses
        if (data && typeof data === 'object' && 'items' in data && 'meta' in data) {
          return {
            data: data.items,
            meta: data.meta,
            timestamp: new Date().toISOString(),
          };
        }

        // Wrap response in standard format
        return {
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
