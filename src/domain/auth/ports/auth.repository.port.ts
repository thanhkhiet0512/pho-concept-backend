import { AdminUserEntity } from '../entities/admin-user.entity';

export abstract class AuthRepositoryPort {
  abstract findByEmail(email: string): Promise<AdminUserEntity | null>;
  abstract findById(id: bigint): Promise<AdminUserEntity | null>;
  abstract updateLastLogin(id: bigint): Promise<void>;
}
