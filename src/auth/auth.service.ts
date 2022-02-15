import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Connection, Repository } from 'typeorm';

import { User } from '@/user/models/user.model';

import { RegisterDTO } from './dto/register-dto';
import {
  RefreshToken,
  RefreshTokenRevokedReason,
} from './models/refresh-token.model';
import { ResetPasswordToken } from './models/reset-password-token.model';
import { JwtAccessTokenPayload } from './strategies/jwt.strategy';
import { JwtRefreshTokenPayload } from './strategies/jwt-refresh.strategy';
import { Role } from '@/user/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly connection: Connection,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(ResetPasswordToken)
    private readonly resetPasswordTokenRepo: Repository<ResetPasswordToken>,

    private readonly jwtService: JwtService,
  ) { }

  /**
   * Method used by Passport strategy to retrieve a valid User or throw accordingly based on email / password combination
   *
   * @param email user's email
   * @param password user's password
   *
   * @returns User record
   */
  public async validateLocalUser(
    email: string,
    password: string,
  ): Promise<User> {
    const identifier = email.trim().toLowerCase();
    const user = await this.userRepo.findOne({ where: { email: identifier } });

    if (!user) throw new UnauthorizedException('auth/user-not-found');

    if (!user.password)
      throw new UnauthorizedException('auth/user-without-password');

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched)
      throw new UnauthorizedException('auth/invalid-password');

    return user;
  }

  /**
   * Method used by Passport strategy to retrieve a valid User or throw accordingly based on a JWT accessToken
   *
   * @param payload Decoded access token jwt payload
   * @returns valid User record
   */
  public async validateJwtUser(
    payload: JwtAccessTokenPayload,
  ): Promise<{ user: User }> {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .where('user.id = :sub')
      .setParameters({ sub: payload.sub })
      .getOne();

    if (!user) throw new UnauthorizedException('auth/user-not-found');

    return { user };
  }

  /**
   * Method used by Passport strategy to retrieve a valid RefreshToken or throw accordingly based on a JWT refreshToken
   *
   * @param payload Decoded refresh token jwt payload
   * @returns valid RefreshToken record
   */
  public async validateJwtRefreshToken(
    payload: JwtRefreshTokenPayload,
  ): Promise<RefreshToken> {
    const refreshToken = await this.refreshTokenRepo
      .createQueryBuilder('refreshToken')
      .where('refreshToken.value = :sub')
      .leftJoinAndSelect('refreshToken.master', 'master')
      .leftJoinAndSelect('refreshToken.child', 'child')
      .setParameters({ sub: payload.sub })
      .getOne();

    if (!refreshToken) throw new UnauthorizedException('auth/token-missing');

    const revokedReason =
      refreshToken?.master?.revokedReason || refreshToken.revokedReason;
    const revokedAt = refreshToken?.master?.revokedAt || refreshToken.revokedAt;

    switch (revokedReason) {
      case RefreshTokenRevokedReason.ABUSE:
        throw new ForbiddenException('auth/refresh-token-abuse');
      case RefreshTokenRevokedReason.LOGOUT:
        throw new ForbiddenException('auth/refresh-token-logged-out');
      case RefreshTokenRevokedReason.SUSPICIOUS:
        throw new ForbiddenException('auth/refresh-token-suspicious');
    }

    if (revokedAt) {
      throw new ForbiddenException('auth/refresh-token-revoked');
    } else if (refreshToken.child) {
      throw new ForbiddenException('auth/refresh-token-consumed');
    }

    return refreshToken;
  }

  /**
   * Generate tokens for a given user at login. This is the first time tokens are generated.
   * Refresh token should not have master in this method since we create a family here.
   *
   * @param user
   * @returns Record with generated access and refresh tokens
   */
  public async login(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this._generateJwtAccessToken(user),
      this._generateMasterJwtRefreshToken(user),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  public async register(body: RegisterDTO) {
    const existingUser = await this.userRepo
      .createQueryBuilder('user')
      .where('user.email = :email')
      .setParameters({ email: body.email.trim().toLowerCase() })
      .getOne();

    if (existingUser) {
      throw new ForbiddenException('auth/user-already-exist');
    }

    const user = new User({
      email: body.email.trim().toLowerCase(),
      password: await this._hashPassword(body.password),
    });

    await this.userRepo.save(user);

    const [accessToken, refreshToken] = await Promise.all([
      this._generateJwtAccessToken(user),
      this._generateMasterJwtRefreshToken(user),
    ]);

    return {
      user: existingUser,
      accessToken,
      refreshToken,
    };
  }

  public async tokenRotate(previous: RefreshToken) {
    const [accessToken, refreshToken] = await Promise.all([
      this._generateJwtAccessToken(previous.userId),
      this._generateSlaveJwtRefreshToken(previous),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  public async logoutRefreshToken(refreshToken: RefreshToken) {
    await this.refreshTokenRepo
      .createQueryBuilder('token')
      .update(RefreshToken)
      .set({
        revokedAt: new Date(),
        revokedReason: RefreshTokenRevokedReason.LOGOUT,
      })
      .where('id = :tokenId')
      .orWhere('masterId = :tokenId')
      .setParameters({ tokenId: refreshToken.masterId || refreshToken.id })
      .execute();
  }

  public async logoutUser(userId: User['id']) {
    await this.refreshTokenRepo.update(
      {
        userId,
      },
      {
        revokedAt: new Date(),
        revokedReason: RefreshTokenRevokedReason.LOGOUT,
      },
    );
  }

  public async forgottenPassword(email: string) {
    const user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user) throw new NotFoundException('auth/user-not-found');

    const resetToken = await this.resetPasswordTokenRepo.save({
      value: this._generateCryptoId(),
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
    });

    console.log('////////////////////////////////////////////////////////');
    console.log('////////////////////// RESET_TOKEN /////////////////////');
    console.log(resetToken.value);
    console.log('////////////////////////////////////////////////////////');

    // await this.emailService.sendForgottenPasswordEmail(user, resetToken);
  }

  public async resetPassword(value: string, password: string) {
    const resetToken = await this.resetPasswordTokenRepo
      .createQueryBuilder('token')
      .innerJoinAndSelect('token.user', 'user')
      .where('token.value = :value')
      .setParameters({ value })
      .getOne();

    if (!resetToken) {
      throw new NotFoundException('auth/reset-token-not-found');
    } else if (resetToken.expiresAt && resetToken.expiresAt <= new Date()) {
      throw new ForbiddenException('auth/reset-token-expired');
    } else if (resetToken.consumedAt) {
      throw new ForbiddenException('auth/reset-token-consumed');
    }

    const user = resetToken.user;

    await this.connection.transaction(async (manager) => {
      resetToken.consumedAt = new Date();
      user.password = await this._hashPassword(password);

      await manager.save(resetToken);
      await manager.save(user);
    });
  }

  public async updatePassword(user: User, password: string) {
    user.password = await this._hashPassword(password);

    return this.userRepo.save(user);
  }

  private async _generateMasterJwtRefreshToken(user: User) {
    const refreshToken = new RefreshToken({
      value: this._generateCryptoId(),
      user,
    });

    await this.refreshTokenRepo.save(refreshToken);

    return this._signRefreshToken(refreshToken);
  }

  private async _generateSlaveJwtRefreshToken(previousToken: RefreshToken) {
    const masterToken = await this.refreshTokenRepo.findOneOrFail(
      previousToken.masterId || previousToken.id,
    );

    const refreshToken = await this.refreshTokenRepo.save({
      userId: masterToken.userId,
      masterId: masterToken.id,
      parentId: previousToken.id,
      value: this._generateCryptoId(),
    });

    return this._signRefreshToken(refreshToken);
  }

  private _signRefreshToken(refreshToken: RefreshToken) {
    const payload: JwtRefreshTokenPayload = {
      sub: refreshToken.value,
      type: 'RefreshToken',
    };

    return this.jwtService.sign(payload, {
      expiresIn: 1000 * 60 * 60, // 1 hour,
    });
  }

  private async _generateJwtAccessToken(user: User | User['id']) {
    if (typeof user === 'string') {
      user = await this.userRepo.findOneOrFail(user);
    }

    const payload: JwtAccessTokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'AccessToken',
    };

    await this.userRepo.save(user);

    return this.jwtService.sign(payload, {
      expiresIn: 1000 * 60 * 10, // 10 minutes,
    });
  }

  /**
   * Generate cryptographically secure random id
   */
  private _generateCryptoId() {
    return crypto.randomBytes(64).toString('base64');
  }

  private async _hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }
}
