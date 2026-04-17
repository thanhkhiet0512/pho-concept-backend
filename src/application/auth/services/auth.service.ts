import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthRepositoryPort } from '@domain/auth/ports/auth.repository.port';
import { LoginDto } from '../dtos/login.dto';
import { AuthTokens, AdminJwtPayload } from '@domain/auth/types/auth.types';

@Injectable()
export class AuthService {
  private readonly ACCESS_EXPIRES_IN = '24h';
  private readonly REFRESH_EXPIRES_IN = '7d';

  constructor(
    private readonly authRepository: AuthRepositoryPort,
    private readonly jwtService: JwtService,
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
      const payload = await this.jwtService.verifyAsync<AdminJwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'jwt-refresh-secret',
      });

      if (payload.type !== 'admin') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.authRepository.findById(BigInt(payload.sub));
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return this.generateTokens(user.id, user.email, user.name, user.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: bigint): Promise<void> {
    // In a real app, you might want to invalidate the refresh token in Redis
  }

  private generateTokens(userId: bigint, email: string, name: string, role: any): AuthTokens {
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
      secret: process.env.JWT_REFRESH_SECRET || 'jwt-refresh-secret',
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
