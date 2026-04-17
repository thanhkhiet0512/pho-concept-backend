import { Injectable, Inject, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginCustomerDto } from '../dtos';
import { AuthTokens, CustomerJwtPayload } from '@domain/auth/types/auth.types';

const CUSTOMER_REPO_TOKEN = 'CustomerRepository';

@Injectable()
export class LoginCustomerUseCase {
  private readonly ACCESS_EXPIRES_IN = '24h';
  private readonly REFRESH_EXPIRES_IN = '7d';

  constructor(
    @Inject(CUSTOMER_REPO_TOKEN) private readonly customerRepository: any,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginCustomerDto): Promise<AuthTokens> {
    const customer = await this.customerRepository.findByEmail(dto.email);
    if (!customer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, customer.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!customer.isActive) {
      throw new ForbiddenException('Account is inactive');
    }

    await this.customerRepository.updateLastLogin(customer.id);

    return this.generateTokens(customer.id, customer.email, customer.name);
  }

  private generateTokens(customerId: bigint, email: string, name: string): AuthTokens {
    const payload: CustomerJwtPayload = {
      sub: Number(customerId),
      email,
      name,
      type: 'customer',
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_EXPIRES_IN,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.REFRESH_EXPIRES_IN,
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
