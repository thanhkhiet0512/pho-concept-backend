import { AdminRole } from '@common/enums/admin-role.enum';
import { AdminUserEntity } from '@domain/auth/entities/admin-user.entity';

export interface AdminUserRepositoryPort {
  findById(id: bigint): Promise<AdminUserEntity | null>;
  findByEmail(email: string): Promise<AdminUserEntity | null>;
  findAll(params?: { page?: number; limit?: number; role?: AdminRole; isActive?: boolean }): Promise<{
    data: AdminUserEntity[];
    total: number;
  }>;
  create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role: AdminRole;
  }): Promise<AdminUserEntity>;
  update(id: bigint, data: {
    name?: string;
    role?: AdminRole;
    isActive?: boolean;
  }): Promise<AdminUserEntity>;
  updatePassword(id: bigint, passwordHash: string): Promise<void>;
  updateLastLogin(id: bigint): Promise<void>;
  delete(id: bigint): Promise<void>;
  count(params?: { role?: AdminRole; isActive?: boolean }): Promise<number>;
}
