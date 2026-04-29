import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { CustomerRepositoryPort } from '@domain/customer/ports/customer.repository.port';

const CUSTOMER_REPO_TOKEN = 'CustomerRepository';

@Injectable()
export class GetCustomerProfileUseCase {
  constructor(
    @Inject(CUSTOMER_REPO_TOKEN) private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(userId: bigint) {
    const customer = await this.customerRepository.findById(userId);
    if (!customer || !customer.isActive) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      avatarUrl: customer.avatarUrl,
      createdAt: customer.createdAt,
    };
  }
}
