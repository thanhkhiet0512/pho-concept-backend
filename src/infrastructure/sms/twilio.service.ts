import { Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface SendSmsParams {
  to: string;
  body: string;
  template: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private readonly client: twilio.Twilio;
  private readonly from: string;

  constructor(private readonly prisma: PrismaService) {
    this.client = twilio(
      process.env['TWILIO_ACCOUNT_SID']!,
      process.env['TWILIO_AUTH_TOKEN']!,
    );
    this.from = process.env['TWILIO_FROM']!;
  }

  async sendSms(params: SendSmsParams): Promise<void> {
    try {
      await this.client.messages.create({
        to: params.to,
        from: this.from,
        body: params.body,
      });

      await this.prisma.notificationLog.create({
        data: {
          type: 'sms',
          recipient: params.to,
          template: params.template,
          status: 'SENT',
          sentAt: new Date(),
          metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${params.to}`, error);

      await this.prisma.notificationLog.create({
        data: {
          type: 'sms',
          recipient: params.to,
          template: params.template,
          status: 'FAILED',
          error: error instanceof Error ? error.message : String(error),
          metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });

      throw error;
    }
  }
}
