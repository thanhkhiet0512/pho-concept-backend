import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AdminUserRepositoryPort } from '@domain/auth/ports/admin-user.repository.port';
import { AdminUserEntity } from '@domain/auth/entities/admin-user.entity';
import { CreateAdminUserDto, AdminUserQueryDto } from '../dtos';
import { ADMIN_USER_REPOSITORY_TOKEN } from '@domain/auth/ports/admin-user.repository.token';

@Injectable()
export class GetAdminUsersUseCase {
  constructor(
    @Inject(ADMIN_USER_REPOSITORY_TOKEN)
    private readonly adminUserRepository: AdminUserRepositoryPort,
  ) {}

  async execute(query: AdminUserQueryDto): Promise<{ data: AdminUserEntity[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const result = await this.adminUserRepository.findAll({
      page,
      limit,
      role: query.role,
      isActive: query.isActive,
    });

    return {
      ...result,
      page,
      limit,
    };
  }
}

@Injectable()
export class GetAdminUserByIdUseCase {
  constructor(
    @Inject(ADMIN_USER_REPOSITORY_TOKEN)
    private readonly adminUserRepository: AdminUserRepositoryPort,
  ) {}

  async execute(id: bigint): Promise<AdminUserEntity> {
    const user = await this.adminUserRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Admin user not found');
    }
    return user;
  }
}

@Injectable()
export class CreateAdminUserUseCase {
  private readonly SALT_ROUNDS = 12;

  constructor(
    @Inject(ADMIN_USER_REPOSITORY_TOKEN)
    private readonly adminUserRepository: AdminUserRepositoryPort,
  ) {}

  async execute(dto: CreateAdminUserDto): Promise<AdminUserEntity> {
    const existing = await this.adminUserRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    return this.adminUserRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: dto.role,
    });
  }
}

@Injectable()
export class UpdateAdminUserUseCase {
  constructor(
    @Inject(ADMIN_USER_REPOSITORY_TOKEN)
    private readonly adminUserRepository: AdminUserRepositoryPort,
  ) {}

  async execute(id: bigint, dto: { name?: string; role?: string; isActive?: boolean }): Promise<AdminUserEntity> {
    const user = await this.adminUserRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Admin user not found');
    }

    return this.adminUserRepository.update(id, {
      name: dto.name,
      role: dto.role as any,
      isActive: dto.isActive,
    });
  }
}

@Injectable()
export class DeleteAdminUserUseCase {
  constructor(
    @Inject(ADMIN_USER_REPOSITORY_TOKEN)
    private readonly adminUserRepository: AdminUserRepositoryPort,
  ) {}

  async execute(id: bigint): Promise<void> {
    const user = await this.adminUserRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Admin user not found');
    }
    await this.adminUserRepository.delete(id);
  }
}

@Injectable()
export class ChangeAdminPasswordUseCase {
  private readonly SALT_ROUNDS = 12;

  constructor(
    @Inject(ADMIN_USER_REPOSITORY_TOKEN)
    private readonly adminUserRepository: AdminUserRepositoryPort,
  ) {}

  async execute(id: bigint, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.adminUserRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Admin user not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new ConflictException('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    await this.adminUserRepository.updatePassword(id, newPasswordHash);
  }
}
