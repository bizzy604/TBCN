import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

/**
 * Rate Limit Guard
 * Extends ThrottlerGuard with custom error message
 */
@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      'Too many requests. Please try again later.',
    );
  }

  /**
   * Get tracker key (IP address by default)
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ip;
  }
}
