import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface SendEmailParams {
  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class SendgridService {
  private readonly logger = new Logger(SendgridService.name);
  private readonly enabled: boolean;

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env['SENDGRID_API_KEY'];
    this.enabled = !!apiKey;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    } else {
      this.logger.warn('SENDGRID_API_KEY not set — email sending disabled');
    }
  }

  async sendEmail(params: SendEmailParams): Promise<void> {
    if (!this.enabled) {
      this.logger.warn(`Email skipped (no API key): ${params.template} → ${params.to}`);
      return;
    }

    let html: string;
    try {
      html = this.renderTemplate(params.template, params.context);
    } catch (error) {
      this.logger.error(`Failed to render template ${params.template}`, error);
      throw error;
    }

    try {
      await sgMail.send({
        to: params.to,
        from: { email: 'noreply@phoconcept.com', name: 'Pho Concept' },
        subject: params.subject,
        html,
      });

      await this.prisma.notificationLog.create({
        data: {
          type: 'email',
          recipient: params.to,
          subject: params.subject,
          template: params.template,
          status: 'SENT',
          sentAt: new Date(),
          metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send email to ${params.to}`, error);

      await this.prisma.notificationLog.create({
        data: {
          type: 'email',
          recipient: params.to,
          subject: params.subject,
          template: params.template,
          status: 'FAILED',
          error: error instanceof Error ? error.message : String(error),
          metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });

      throw error;
    }
  }

  private renderTemplate(templateName: string, context: Record<string, unknown>): string {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
    try {
      const source = fs.readFileSync(templatePath, 'utf8');
      const compiled = Handlebars.compile(source);
      return compiled(context);
    } catch (error) {
      this.logger.error(`Template not found or failed to render: ${templatePath}`, error);
      throw new Error(`Email template "${templateName}" could not be rendered`);
    }
  }
}
