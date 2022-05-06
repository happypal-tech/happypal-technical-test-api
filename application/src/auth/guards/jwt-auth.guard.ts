import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { IS_PUBLIC_KEY } from '../decorators/Public.decorator';

type ContextType = 'http' | 'graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext) {
    switch (context.getType<ContextType>()) {
      case 'graphql':
        return this.getGraphQLRequest(context);
      case 'http':
        return this.getHTTPRequest(context);
    }
  }

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

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  private getGraphQLRequest(context: ExecutionContext) {
    return GqlExecutionContext.create(context).getContext<{ req: Request }>()
      .req;
  }

  private getHTTPRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest();
  }
}
