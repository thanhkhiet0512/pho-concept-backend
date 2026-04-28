import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { AuthModule } from './presentation/auth/auth.module';
import { CustomerAuthModule } from './presentation/customer/customer-auth.module';
import { LocationModule } from './presentation/location/location.module';
import { AdminUserModule } from './presentation/admin/admin-user.module';
import { MenuModule } from './presentation/menu/menu.module';
import { CmsModule } from './presentation/cms/cms.module';
import { ReservationModule } from './presentation/reservation/reservation.module';
import { HealthModule } from './health/health.module';
import { I18nConfig } from './i18n/i18n.config';
import { I18nAppModule } from './i18n/i18n.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { SmsModule } from './infrastructure/sms/sms.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { CateringModule } from './presentation/catering/catering.module';
import { DashboardModule } from './presentation/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nConfig,
    I18nAppModule,
    PrismaModule,
    RedisModule,
    AuthModule,
    CustomerAuthModule,
    LocationModule,
    AdminUserModule,
    MenuModule,
    CmsModule,
    ReservationModule,
    HealthModule,
    MailModule,
    SmsModule,
    QueueModule,
    CateringModule,
    DashboardModule,
  ],
})
export class AppModule {}
