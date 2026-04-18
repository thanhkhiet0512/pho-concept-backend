import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { JwtStrategy } from '@common/strategies/jwt.strategy';
import { AuthService } from '@application/auth/services/auth.service';
import { AuthRepositoryPort } from '@domain/auth/ports/auth.repository.port';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { RedisModule } from '@infrastructure/redis/redis.module';
import { AuthAdapter } from '@infrastructure/prisma/repositories/auth/auth.adapter';
import { CustomerAdapter } from '@infrastructure/prisma/repositories/customer/customer.adapter';

const CUSTOMER_REPO_TOKEN = 'CustomerRepository';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AdminAuthController],
  providers: [
    JwtAuthGuard,
    JwtStrategy,
    AuthService,
    AuthAdapter,
    CustomerAdapter,
    { provide: AuthRepositoryPort, useClass: AuthAdapter },
    { provide: CUSTOMER_REPO_TOKEN, useClass: CustomerAdapter },
  ],
  exports: [AuthService, AuthRepositoryPort, JwtAuthGuard, JwtStrategy, CustomerAdapter, CUSTOMER_REPO_TOKEN],
})
export class AuthModule {}
