import { Injectable, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepositoryPort } from '@domain/auth/ports/auth.repository.port';
import { RedisService } from '@infrastructure/redis/redis.service';
import { LoginDto } from '@application/auth/dtos/login.dto';
import { AuthTokens, AdminJwtPayload } from '@domain/auth/types/auth.types';
import { AdminRole } from '@domain/auth/enums/admin-role.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly ACCESS_EXPIRES_IN = '24h';
  private readonly REFRESH_EXPIRES_IN = '7d';

  constructor(
    private readonly authRepository: AuthRepositoryPort,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.authRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is inactive');
    }

    await this.authRepository.updateLastLogin(user.id);

    return this.generateTokens(user.id, user.email, user.name, user.role);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      const isBlacklisted = await this.redisService.exists(`blacklist:admin:${refreshToken}`);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      const payload = await this.jwtService.verifyAsync<AdminJwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (payload.type !== 'admin') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.authRepository.findById(BigInt(payload.sub));
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return this.generateTokens(user.id, user.email, user.name, user.role);
    } catch (error) {
      this.logger.error('Token refresh failed', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: bigint, refreshToken: string): Promise<void> {
    const ttl = 7 * 24 * 60 * 60; // 7 days in seconds
    await this.redisService.set(`blacklist:admin:${refreshToken}`, '1', ttl);
  }

  private generateTokens(userId: bigint, email: string, name: string, role: AdminRole): AuthTokens {
    const payload: AdminJwtPayload = {
      sub: Number(userId),
      email,
      name,
      role,
      type: 'admin',
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_EXPIRES_IN,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.REFRESH_EXPIRES_IN,
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: this.ACCESS_EXPIRES_IN,
      refresh_expires_in: this.REFRESH_EXPIRES_IN,
    };
  }
}
