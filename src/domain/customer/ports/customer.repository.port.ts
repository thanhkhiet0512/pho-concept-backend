import { CustomerEntity } from '../entities/customer.entity';

export interface CustomerRepositoryPort {
  findByEmail(email: string): Promise<CustomerEntity | null>;
  findById(id: bigint): Promise<CustomerEntity | null>;
  create(data: {
    email: string;
    passwordHash: string;
    name: string;
    phone?: string;
  }): Promise<CustomerEntity>;
  updateLastLogin(id: bigint): Promise<void>;
}
