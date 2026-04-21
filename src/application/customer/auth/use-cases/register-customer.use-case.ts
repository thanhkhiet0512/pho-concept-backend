import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterCustomerDto } from '@application/customer/auth/dtos';
import { AuthTokens, CustomerJwtPayload } from '@domain/auth/types/auth.types';
import { CustomerRepositoryPort } from '@domain/customer/ports/customer.repository.port';

const CUSTOMER_REPO_TOKEN = 'CustomerRepository';

@Injectable()
export class RegisterCustomerUseCase {
  private readonly ACCESS_EXPIRES_IN = '24h';
  private readonly REFRESH_EXPIRES_IN = '7d';

  constructor(
    @Inject(CUSTOMER_REPO_TOKEN) private readonly customerRepository: CustomerRepositoryPort,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: RegisterCustomerDto): Promise<AuthTokens> {
    const existingCustomer = await this.customerRepository.findByEmail(dto.email);
    if (existingCustomer) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const customer = await this.customerRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      phone: dto.phone,
    });

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
