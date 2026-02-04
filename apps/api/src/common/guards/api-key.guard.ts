import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * API Key Guard
 * Validates API key for external integrations
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    const validApiKey = this.configService.get<string>('API_KEY');

    if (!validApiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }

  /**
   * Extract API key from X-API-Key header or query param
   */
  private extractApiKey(request: Request): string | undefined {
    return (
      (request.headers['x-api-key'] as string) ||
      (request.query['api_key'] as string)
    );
  }
}
