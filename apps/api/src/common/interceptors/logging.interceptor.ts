import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Logging Interceptor
 * Logs all incoming requests and outgoing responses with timing
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, body, headers } = request;
    const correlationId = headers['x-correlation-id'] || this.generateCorrelationId();
    const userAgent = headers['user-agent'] || 'Unknown';
    const ip = request.ip || request.socket.remoteAddress;

    // Set correlation ID in response headers
    response.setHeader('X-Correlation-ID', correlationId);

    const startTime = Date.now();

    // Log incoming request
    this.logger.log(
      `[${correlationId}] --> ${method} ${url} - IP: ${ip} - UA: ${userAgent.substring(0, 50)}`,
    );

    // Log request body in development (exclude sensitive data)
    if (process.env.NODE_ENV === 'development' && body && Object.keys(body).length > 0) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`[${correlationId}] Body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          this.logger.log(
            `[${correlationId}] <-- ${method} ${url} - ${statusCode} - ${duration}ms`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          this.logger.error(
            `[${correlationId}] <-- ${method} ${url} - ${statusCode} - ${duration}ms - ${error.message}`,
          );
        },
      }),
    );
  }

  /**
   * Generate a unique correlation ID
   */
  private generateCorrelationId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Remove sensitive fields from request body
   */
  private sanitizeBody(body: Record<string, any>): Record<string, any> {
    const sensitiveFields = ['password', 'confirmPassword', 'token', 'accessToken', 'refreshToken', 'secret', 'apiKey'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
