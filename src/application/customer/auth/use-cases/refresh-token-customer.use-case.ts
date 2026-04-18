import { Injectable, Inject, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from '../dtos';
import { AuthTokens, CustomerJwtPayload } from '@domain/auth/types/auth.types';

const CUSTOMER_REPO_TOKEN = 'CustomerRepository';

@Injectable()
export class RefreshTokenCustomerUseCase {
  private readonly ACCESS_EXPIRES_IN = '24h';
  private readonly REFRESH_EXPIRES_IN = '7d';

  constructor(
    @Inject(CUSTOMER_REPO_TOKEN) private readonly customerRepository: any,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<AuthTokens> {
    try {
      const payload = await this.jwtService.verifyAsync<CustomerJwtPayload>(dto.refresh_token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (payload.type !== 'customer') {
        throw new UnauthorizedException('Invalid token type');
      }

      const customer = await this.customerRepository.findById(BigInt(payload.sub));
      if (!customer || !customer.isActive) {
        throw new NotFoundException('Customer not found or inactive');
      }

      return this.generateTokens(customer.id, customer.email, customer.name);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
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
