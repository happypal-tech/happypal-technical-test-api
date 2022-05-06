import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { IStrategyOptions, Strategy } from 'passport-local';

import { User } from '@/user/models/user.model';

import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    } as IStrategyOptions);
  }

  async validate(email: string, password: string): Promise<User> {
    return this.authService.validateLocalUser(email, password);
  }
}
