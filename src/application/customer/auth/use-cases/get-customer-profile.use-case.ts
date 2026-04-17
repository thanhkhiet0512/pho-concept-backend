import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';

const CUSTOMER_REPO_TOKEN = 'CustomerRepository';

@Injectable()
export class GetCustomerProfileUseCase {
  constructor(
    @Inject(CUSTOMER_REPO_TOKEN) private readonly customerRepository: any,
  ) {}

  async execute(userId: bigint) {
    const customer = await this.customerRepository.findById(userId);
    if (!customer) {
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
