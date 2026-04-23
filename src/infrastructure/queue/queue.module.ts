import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CateringQueue } from './catering.queue';
import { CateringWorker } from './workers/catering.worker';
import { MailModule } from '@infrastructure/mail/mail.module';
import { SmsModule } from '@infrastructure/sms/sms.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: { url: process.env['REDIS_URL']! },
    }),
    BullModule.registerQueue({ name: 'catering-queue' }),
    MailModule,
    SmsModule,
  ],
  providers: [CateringQueue, CateringWorker],
  exports: [CateringQueue],
})
export class QueueModule implements OnModuleInit {
  constructor(private readonly cateringQueue: CateringQueue) {}

  async onModuleInit() {
    await this.cateringQueue.ensureExpireCheck();
  }
}
