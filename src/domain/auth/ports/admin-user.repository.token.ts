import { InjectionToken } from '@nestjs/common';
import { AdminUserRepositoryPort } from '@domain/auth/ports/admin-user.repository.port';

export const ADMIN_USER_REPOSITORY = Symbol('ADMIN_USER_REPOSITORY');

export const ADMIN_USER_REPOSITORY_TOKEN: InjectionToken<AdminUserRepositoryPort> =
  ADMIN_USER_REPOSITORY;
