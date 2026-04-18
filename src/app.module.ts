import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { AuthModule } from './presentation/auth/auth.module';
import { CustomerAuthModule } from './presentation/customer/customer-auth.module';
import { LocationModule } from './presentation/location/location.module';
import { AdminUserModule } from './presentation/admin/admin-user.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    AuthModule,
    CustomerAuthModule,
    LocationModule,
    AdminUserModule,
    HealthModule,
  ],
})
export class AppModule {}
