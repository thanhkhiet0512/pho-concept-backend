import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { CustomerRepositoryPort } from '@domain/customer/ports/customer.repository.port';
import { extractJwtFromRequest } from '@common/strategies/jwt-extractor.helper';
import { CustomerJwtPayload } from '@domain/auth/types/auth.types';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
  constructor(private readonly customerRepository: CustomerRepositoryPort) {
    super({
      jwtFromRequest: extractJwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
    });
  }

  async validate(payload: CustomerJwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    if (payload.type !== 'customer') {
      throw new UnauthorizedException('Invalid token type');
    }

    const customer = await this.customerRepository.findById(BigInt(payload.sub));
    if (!customer || !customer.isActive) {
      throw new UnauthorizedException('Customer not found or inactive');
    }

    return {
      userId: payload.sub,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      type: 'customer',
    };
  }
}
