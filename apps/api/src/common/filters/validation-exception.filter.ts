import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ValidationError {
  property: string;
  constraints: Record<string, string>;
  children?: ValidationError[];
}

/**
 * Validation Exception Filter
 * Handles class-validator validation errors with detailed field errors
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const exceptionResponse = exception.getResponse() as any;

    // Check if this is a validation error
    if (
      !exceptionResponse.message ||
      !Array.isArray(exceptionResponse.message)
    ) {
      // Not a validation error, let it pass through
      response.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: exceptionResponse.message || 'Bad request',
        },
        path: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Format validation errors
    const validationErrors = this.formatValidationErrors(
      exceptionResponse.message,
    );

    const errorResponse = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: validationErrors,
      },
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    this.logger.warn(
      `Validation failed: ${request.method} ${request.url} - ${JSON.stringify(validationErrors)}`,
    );

    response.status(400).json(errorResponse);
  }

  /**
   * Format validation errors into a clean structure
   */
  private formatValidationErrors(
    errors: ValidationError[] | string[],
  ): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    for (const error of errors) {
      if (typeof error === 'string') {
        // Simple string error
        formatted['_error'] = formatted['_error'] || [];
        formatted['_error'].push(error);
      } else if (error.constraints) {
        // Validation error with constraints
        const messages = Object.values(error.constraints);
        formatted[error.property] = messages;
      }
    }

    return formatted;
  }
}
