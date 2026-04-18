import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CustomerAuthController } from './customer-auth.controller';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { RedisModule } from '@infrastructure/redis/redis.module';
import { CustomerAdapter } from '@infrastructure/prisma/repositories/customer/customer.adapter';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { JwtStrategy } from '@common/strategies/jwt.strategy';
import {
  RegisterCustomerUseCase,
  LoginCustomerUseCase,
  RefreshTokenCustomerUseCase,
  GetCustomerProfileUseCase,
  LogoutCustomerUseCase,
} from '@application/customer/auth/use-cases';

const CUSTOMER_REPO_TOKEN = 'CustomerRepository';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [CustomerAuthController],
  providers: [
    JwtAuthGuard,
    JwtStrategy,
    CustomerAdapter,
    { provide: CUSTOMER_REPO_TOKEN, useClass: CustomerAdapter },
    RegisterCustomerUseCase,
    LoginCustomerUseCase,
    RefreshTokenCustomerUseCase,
    GetCustomerProfileUseCase,
    LogoutCustomerUseCase,
  ],
  exports: [CustomerAuthModule, CustomerAdapter, CUSTOMER_REPO_TOKEN],
})
export class CustomerAuthModule {}
