import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global All Exceptions Filter
 * Catches ALL exceptions including non-HTTP errors
 * Use as fallback for unexpected errors
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine status and message
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || message;
      code = (exceptionResponse as any).code || this.getCodeFromStatus(status);
    } else if (exception instanceof Error) {
      message = exception.message;
      // Log full stack trace for non-HTTP errors
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    }

    // Never expose internal error details in production
    if (
      process.env.NODE_ENV === 'production' &&
      status === HttpStatus.INTERNAL_SERVER_ERROR
    ) {
      message = 'An unexpected error occurred. Please try again later.';
    }

    const errorResponse = {
      error: {
        code,
        message,
      },
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      correlationId: request.headers['x-correlation-id'] || null,
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
    );

    response.status(status).json(errorResponse);
  }

  private getCodeFromStatus(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMIT_EXCEEDED',
      500: 'INTERNAL_ERROR',
    };
    return codes[status] || 'UNKNOWN_ERROR';
  }
}
