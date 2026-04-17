import { Module } from '@nestjs/common';
import { AdminUserController } from './admin-user.controller';
import { AdminUserAdapter } from '@infrastructure/prisma/repositories/auth/admin-user.adapter';
import { ADMIN_USER_REPOSITORY_TOKEN } from '@domain/auth/ports/admin-user.repository.token';
import {
  GetAdminUsersUseCase,
  GetAdminUserByIdUseCase,
  CreateAdminUserUseCase,
  UpdateAdminUserUseCase,
  DeleteAdminUserUseCase,
} from '@application/admin/user/use-cases';

@Module({
  controllers: [AdminUserController],
  providers: [
    {
      provide: ADMIN_USER_REPOSITORY_TOKEN,
      useClass: AdminUserAdapter,
    },
    GetAdminUsersUseCase,
    GetAdminUserByIdUseCase,
    CreateAdminUserUseCase,
    UpdateAdminUserUseCase,
    DeleteAdminUserUseCase,
  ],
  exports: [ADMIN_USER_REPOSITORY_TOKEN],
})
export class AdminUserModule {}
