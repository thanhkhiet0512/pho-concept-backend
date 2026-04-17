import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CustomerRepositoryPort } from '@domain/customer/ports/customer.repository.port';
import { CustomerEntity } from '@domain/customer/entities/customer.entity';

@Injectable()
export class CustomerAdapter implements CustomerRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<CustomerEntity | null> {
    const customer = await this.prisma.customer.findUnique({ where: { email } });
    if (!customer) return null;
    return CustomerEntity.reconstitute({
      id: customer.id,
      email: customer.email,
      passwordHash: customer.passwordHash,
      name: customer.name,
      phone: customer.phone,
      avatarUrl: customer.avatarUrl,
      isActive: customer.isActive,
      lastLoginAt: customer.lastLoginAt,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    });
  }

  async findById(id: bigint): Promise<CustomerEntity | null> {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) return null;
    return CustomerEntity.reconstitute({
      id: customer.id,
      email: customer.email,
      passwordHash: customer.passwordHash,
      name: customer.name,
      phone: customer.phone,
      avatarUrl: customer.avatarUrl,
      isActive: customer.isActive,
      lastLoginAt: customer.lastLoginAt,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    phone?: string;
  }): Promise<CustomerEntity> {
    const customer = await this.prisma.customer.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        phone: data.phone ?? null,
      },
    });
    return CustomerEntity.reconstitute({
      id: customer.id,
      email: customer.email,
      passwordHash: customer.passwordHash,
      name: customer.name,
      phone: customer.phone,
      avatarUrl: customer.avatarUrl,
      isActive: customer.isActive,
      lastLoginAt: customer.lastLoginAt,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    });
  }

  async updateLastLogin(id: bigint): Promise<void> {
    await this.prisma.customer.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}
