import {
  Body,
  Controller,
  HttpCode,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { User } from '@/user/models/user.model';

import { AuthService } from '../auth.service';
import { Public } from '../decorators/Public.decorator';
import { ForgottenPasswordDTO } from '../dto/forgotten-password.dto';
import { LogoutDTO } from '../dto/logout.dto';
import { RegisterDTO } from '../dto/register-dto';
import { ResetPasswordDTO } from '../dto/reset-password.dto';
import { UpdatePasswordDTO } from '../dto/update-password.dto';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { RefreshToken } from '../models/refresh-token.model';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  public login(@Req() req: Request) {
    return this.authService.login(req.user as User);
  }

  @Post('register')
  @Public()
  public async register(@Body() body: RegisterDTO) {
    const { refreshToken, accessToken } = await this.authService.register(body);

    return {
      refreshToken,
      accessToken,
    };
  }

  @Post('logout')
  @HttpCode(204)
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  public logout(@Req() req: Request, @Body() body: LogoutDTO) {
    if (body.all) {
      return this.authService.logoutUser((req.user as RefreshToken).userId);
    } else {
      return this.authService.logoutRefreshToken(req.user as RefreshToken);
    }
  }

  @Post('token')
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  public token(@Req() req: Request) {
    return this.authService.tokenRotate(req.user as RefreshToken);
  }

  @Put('password')
  @Public()
  @UseGuards(LocalAuthGuard)
  public async updatePassword(
    @Req() req: Request,
    @Body() body: UpdatePasswordDTO,
  ) {
    await this.authService.updatePassword(req.user as User, body.newPassword);
    await this.authService.logoutUser((req.user as User).id);
    return await this.authService.login(req.user as User);
  }

  @Post('forgotten-password')
  @Public()
  @HttpCode(202)
  public async forgottenPassword(
    @Req() req: Request,
    @Body() body: ForgottenPasswordDTO,
  ) {
    await this.authService.forgottenPassword(body.email);
  }

  @Put('reset-password')
  @Public()
  @HttpCode(200)
  public async resetPassword(
    @Req() req: Request,
    @Body() body: ResetPasswordDTO,
  ) {
    await this.authService.resetPassword(body.token, body.password);
  }
}
