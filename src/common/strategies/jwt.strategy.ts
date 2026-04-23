import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthRepositoryPort } from '@domain/auth/ports/auth.repository.port';
import { CustomerRepositoryPort } from '@domain/customer/ports/customer.repository.port';
import { extractJwtFromRequest } from '@common/strategies/jwt-extractor.helper';
import { AdminJwtPayload, CustomerJwtPayload } from '@domain/auth/types/auth.types';

const CUSTOMER_REPO_TOKEN = 'CustomerRepository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authRepository: AuthRepositoryPort,
    @Inject(CUSTOMER_REPO_TOKEN) private readonly customerRepository: CustomerRepositoryPort,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractJwtFromRequest]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
    });
  }

  async validate(payload: AdminJwtPayload | CustomerJwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    if (payload.type === 'admin') {
      const user = await this.authRepository.findById(BigInt(payload.sub));
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return {
        _info: {
          id: Number(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
          type: 'admin' as const,
        },
      };
    } else if (payload.type === 'customer') {
      const customer = await this.customerRepository.findById(BigInt(payload.sub));
      if (!customer || !customer.isActive) {
        throw new UnauthorizedException('Customer not found or inactive');
      }

      return {
        _info: {
          id: Number(customer.id),
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          type: 'customer' as const,
        },
      };
    }

    throw new UnauthorizedException('Invalid token type');
  }
}
