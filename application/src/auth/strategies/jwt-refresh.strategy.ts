import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';

import { AuthService } from '../auth.service';

export type JwtRefreshTokenPayload = {
  sub: string;
  type: 'RefreshToken';
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
      ignoreExpiration: false,
    } as StrategyOptions);
  }

  async validate(payload: any) {
    if (!this.validatePayload(payload)) {
      throw new UnauthorizedException('auth/token-invalid');
    }

    return this.authService.validateJwtRefreshToken(payload);
  }

  private validatePayload(payload: any): payload is JwtRefreshTokenPayload {
    if (payload.type === 'RefreshToken') {
      return true;
    } else {
      return false;
    }
  }
}
