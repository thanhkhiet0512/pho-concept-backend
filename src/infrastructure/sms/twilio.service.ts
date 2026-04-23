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
  private readonly enabled: boolean;

  constructor(private readonly prisma: PrismaService) {
    const sid = process.env['TWILIO_ACCOUNT_SID'];
    const token = process.env['TWILIO_AUTH_TOKEN'];
    const from = process.env['TWILIO_FROM'];
    this.enabled = !!(sid && token && from);
    if (this.enabled) {
      this.client = twilio(sid!, token!);
      this.from = from!;
    } else {
      this.logger.warn('Twilio credentials not set — SMS sending disabled');
      this.client = twilio('', '');
      this.from = '';
    }
  }

  async sendSms(params: SendSmsParams): Promise<void> {
    if (!this.enabled) {
      this.logger.warn(`SMS skipped (no credentials): ${params.template} → ${params.to}`);
      return;
    }

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
