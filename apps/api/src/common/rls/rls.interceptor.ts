import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { rlsContext } from './rls-context';

/**
 * RlsInterceptor — runs AFTER JwtAuthGuard so req.user is already populated.
 * Wraps each HTTP request in an AsyncLocalStorage context carrying the
 * authenticated user's id and role. The RlsSubscriber reads this context
 * before every TypeORM query and sets the matching PostgreSQL session
 * variables, which PostgreSQL RLS policies then use to filter rows.
 *
 * Registered globally in AppModule so every controller benefits
 * automatically without per-route boilerplate.
 */
@Injectable()
export class RlsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as Record<string, string> | undefined;

    const userId: string = user?.['sub'] ?? '';
    const role: string = user?.['role'] ?? 'anonymous';

    return new Observable((subscriber) => {
      rlsContext.run({ userId, role }, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }
}
