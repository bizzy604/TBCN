import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Stamps every request with a unique correlation ID so logs emitted
 * anywhere in the call chain (guards, services, DB subscriber) can be
 * grouped by request without any additional plumbing.
 *
 * The ID is read from the incoming X-Correlation-ID header when present
 * (useful for distributed tracing) or generated fresh otherwise.
 *
 * Note: RLS session-variable injection is handled by RlsInterceptor, which
 * runs after guards so req.user is already available. This middleware only
 * manages the correlation ID.
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || uuidv4();

    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);

    next();
  }
}
