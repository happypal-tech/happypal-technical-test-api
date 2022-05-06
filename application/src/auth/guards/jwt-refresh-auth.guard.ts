import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err: any, user: any, info: any) {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException('auth/token-expired');
    } else if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException('auth/token-invalid');
    } else if (info instanceof Error && info.message === 'No auth token') {
      throw new UnauthorizedException('auth/token-missing');
    } else if (err || !user) {
      throw err || new UnauthorizedException('auth/error');
    }

    return user;
  }
}
