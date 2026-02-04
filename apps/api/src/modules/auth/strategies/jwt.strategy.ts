import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth.service';

/**
 * JWT Strategy
 * Validates JWT tokens and extracts user payload
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      issuer: configService.get<string>('JWT_ISSUER', 'brandcoachnetwork.com'),
    });
  }

  /**
   * Validate the JWT payload
   * This is called after the token signature is verified
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Payload is already verified by Passport
    // Here you could add additional checks like:
    // - User still exists in database
    // - User is not banned/deactivated
    // - Token is not in blacklist

    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Return the user payload to be attached to request.user
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
