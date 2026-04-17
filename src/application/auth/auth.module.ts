import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { AuthRepositoryPort } from '@domain/auth/ports/auth.repository.port';
import { AuthAdapter } from '@infrastructure/prisma/repositories/auth/auth.adapter';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [
    AuthService,
    { provide: AuthRepositoryPort, useClass: AuthAdapter },
  ],
  exports: [AuthService, AuthRepositoryPort],
})
export class AuthModule {}
