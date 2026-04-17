import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AdminUserRepositoryPort } from '@domain/auth/ports/admin-user.repository.port';
import { AdminUserEntity } from '@domain/auth/entities/admin-user.entity';
import { AdminRole } from '@common/enums/admin-role.enum';

@Injectable()
export class AdminUserAdapter implements AdminUserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

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

  async findAll(params?: {
    page?: number;
    limit?: number;
    role?: AdminRole;
    isActive?: boolean;
  }): Promise<{ data: AdminUserEntity[]; total: number }> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params?.role) where.role = params.role;
    if (params?.isActive !== undefined) where.isActive = params.isActive;

    const [users, total] = await Promise.all([
      this.prisma.adminUser.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.adminUser.count({ where }),
    ]);

    return {
      data: users.map((u) =>
        AdminUserEntity.reconstitute({
          id: u.id,
          email: u.email,
          passwordHash: u.passwordHash,
          name: u.name,
          role: u.role as AdminRole,
          isActive: u.isActive,
          lastLoginAt: u.lastLoginAt,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        }),
      ),
      total,
    };
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role: AdminRole;
  }): Promise<AdminUserEntity> {
    const user = await this.prisma.adminUser.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role,
      },
    });
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

  async update(
    id: bigint,
    data: { name?: string; role?: AdminRole; isActive?: boolean },
  ): Promise<AdminUserEntity> {
    const user = await this.prisma.adminUser.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
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

  async updatePassword(id: bigint, passwordHash: string): Promise<void> {
    await this.prisma.adminUser.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async updateLastLogin(id: bigint): Promise<void> {
    await this.prisma.adminUser.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async delete(id: bigint): Promise<void> {
    await this.prisma.adminUser.delete({ where: { id } });
  }

  async count(params?: { role?: AdminRole; isActive?: boolean }): Promise<number> {
    const where: Record<string, unknown> = {};
    if (params?.role) where.role = params.role;
    if (params?.isActive !== undefined) where.isActive = params.isActive;
    return this.prisma.adminUser.count({ where });
  }
}
