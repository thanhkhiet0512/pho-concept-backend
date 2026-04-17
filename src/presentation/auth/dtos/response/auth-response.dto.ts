import { AdminUserEntity } from '@domain/auth/entities/admin-user.entity';

export class AdminUserResponseDto {
  id!: number;
  email!: string;
  name!: string;
  role!: string;
  isActive!: boolean;
  lastLoginAt!: string | null;
  createdAt!: string;
  updatedAt!: string;

  static from(entity: AdminUserEntity): AdminUserResponseDto {
    const dto = new AdminUserResponseDto();
    dto.id = Number(entity.id);
    dto.email = entity.email;
    dto.name = entity.name;
    dto.role = entity.role;
    dto.isActive = entity.isActive;
    dto.lastLoginAt = entity.lastLoginAt?.toISOString() ?? null;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}

export class LoginResponseDto {
  access_token!: string;
  refresh_token!: string;
  token_type!: string;
  expires_in!: string;
  refresh_expires_in!: string;
}

export class RefreshTokenResponseDto {
  access_token!: string;
  refresh_token!: string;
  token_type!: string;
  expires_in!: string;
  refresh_expires_in!: string;
}
