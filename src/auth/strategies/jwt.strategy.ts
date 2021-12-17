import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Request } from 'express';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';

import { User } from '@/user/models/user.model';

import { AuthService } from '../auth.service';

export type JwtAccessTokenPayload = {
  sub: string;
  email: string;
  type: 'AccessToken';
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
      ignoreExpiration: false,
      passReqToCallback: true,
    } as StrategyOptions);
  }

  async validate(req: Request, payload: any): Promise<User> {
    if (!this.validatePayload(payload)) {
      throw new UnauthorizedException('auth/token-invalid');
    }

    const { user } = await this.authService.validateJwtUser(payload);

    return user;
  }

  private validatePayload(payload: any): payload is JwtAccessTokenPayload {
    if (payload.type === 'AccessToken') {
      return true;
    } else {
      return false;
    }
  }
}
