import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AuthRepositoryPort } from '@domain/auth/ports/auth.repository.port';
import { AdminUserEntity } from '@domain/auth/entities/admin-user.entity';
import { AdminRole } from '@common/enums/admin-role.enum';

@Injectable()
export class AuthAdapter implements AuthRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<AdminUserEntity | null> {
    const user = await this.prisma.adminUser.findUnique({ where: { email } });
    if (!user) return null;
    return AdminUserEntity.reconstitute({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      role: user.role as AdminRole,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findById(id: bigint): Promise<AdminUserEntity | null> {
    const user = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!user) return null;
    return AdminUserEntity.reconstitute({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      role: user.role as AdminRole,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async updateLastLogin(id: bigint): Promise<void> {
    await this.prisma.adminUser.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}
