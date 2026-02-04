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
 * Global HTTP Exception Filter
 * Catches all HTTP exceptions and returns consistent error responses
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract error details
    const error =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as Record<string, unknown>);

    // Build error response
    const errorResponse = {
      error: {
        code: this.getErrorCode(status, error),
        message: error.message || 'An error occurred',
        details: error.errors || null,
      },
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      correlationId: request.headers['x-correlation-id'] || null,
    };

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${JSON.stringify(errorResponse.error)}`,
    );

    response.status(status).json(errorResponse);
  }

  /**
   * Get error code from status or custom error
   */
  private getErrorCode(status: number, error: Record<string, unknown>): string {
    if (error.code) {
      return String(error.code);
    }

    const statusCodes: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
      [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMIT_EXCEEDED',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
    };

    return statusCodes[status] || 'UNKNOWN_ERROR';
  }
}
