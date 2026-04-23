import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { PrismaService } from '@infrastructure/prisma/prisma.service';
import { SendgridService } from '@infrastructure/mail/sendgrid.service';
import { TwilioService } from '@infrastructure/sms/twilio.service';
import { CateringJobType } from '../catering.queue';

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const day = date.getDate();
  return `${month} ${day}, ${year}`;
};

@Injectable()
export class CateringWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CateringWorker.name);
  private worker: Worker | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: SendgridService,
    private readonly smsService: TwilioService,
  ) {}

  onModuleInit() {
    this.worker = new Worker(
      'catering-queue',
      async (job: Job<CateringJobType>) => {
        const data = job.data;
        switch (data.type) {
          case 'inquiry_received':  await this.handleInquiryReceived(BigInt(data.requestId)); break;
          case 'quote_sent':        await this.handleQuoteSent(BigInt(data.requestId)); break;
          case 'status_changed':    await this.handleStatusChanged(BigInt(data.requestId), data.newStatus); break;
          case 'expire_check':      await this.handleExpireCheck(); break;
        }
      },
      {
        connection: { url: process.env['REDIS_URL']! },
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Catering job failed: ${job?.data?.type}`, err);
    });
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }

  private async handleInquiryReceived(requestId: bigint): Promise<void> {
    const request = await this.prisma.cateringRequest.findUnique({
      where: { id: requestId },
      include: { package: true },
    });
    if (!request) return;

    await this.mailService.sendEmail({
      to: request.contactEmail,
      subject: 'Pho Concept — Catering Inquiry Received',
      template: 'catering-inquiry-received',
      context: {
        contactName: request.contactName,
        eventDate: formatDate(request.eventDate),
        eventTime: request.eventTime,
        guestCount: request.guestCount,
        venue: request.venue,
        packageName: request.package?.name,
        token: request.token,
      },
      metadata: { cateringRequestId: requestId.toString() },
    });
  }

  private async handleQuoteSent(requestId: bigint): Promise<void> {
    const request = await this.prisma.cateringRequest.findUnique({
      where: { id: requestId },
      include: { items: { include: { menuItem: true } } },
    });
    if (!request) return;

    const items = request.items.map((item) => {
      const nameI18n = item.menuItem?.nameI18n as { en?: string } | null;
      return {
        name: item.customName ?? nameI18n?.en ?? 'Custom Item',
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice).toFixed(2),
        lineTotal: (item.quantity * Number(item.unitPrice)).toFixed(2),
      };
    });

    await this.mailService.sendEmail({
      to: request.contactEmail,
      subject: 'Pho Concept — Your Catering Quote',
      template: 'catering-quote-sent',
      context: {
        contactName: request.contactName,
        eventDate: formatDate(request.eventDate),
        eventTime: request.eventTime,
        guestCount: request.guestCount,
        items,
        quotedAmount: request.quotedAmount != null ? Number(request.quotedAmount).toFixed(2) : '0.00',
        depositAmount: request.depositAmount != null ? Number(request.depositAmount).toFixed(2) : '0.00',
        quotationDeadline: request.quotationDeadline ? formatDate(request.quotationDeadline) : 'N/A',
        token: request.token,
      },
      metadata: { cateringRequestId: requestId.toString() },
    });

    await this.smsService.sendSms({
      to: request.contactPhone,
      body: `Pho Concept: Your catering quote for ${formatDate(request.eventDate)} is ready. Check your email for details.`,
      template: 'catering_quote_sms',
      metadata: { cateringRequestId: requestId.toString() },
    });
  }

  private async handleStatusChanged(requestId: bigint, newStatus: string): Promise<void> {
    if (newStatus !== 'CONFIRMED') return;

    const request = await this.prisma.cateringRequest.findUnique({ where: { id: requestId } });
    if (!request) return;

    await this.mailService.sendEmail({
      to: request.contactEmail,
      subject: 'Pho Concept — Catering Confirmed!',
      template: 'catering-confirmed',
      context: {
        contactName: request.contactName,
        eventDate: formatDate(request.eventDate),
        eventTime: request.eventTime,
        guestCount: request.guestCount,
        quotedAmount: request.quotedAmount != null ? Number(request.quotedAmount).toFixed(2) : '0.00',
      },
      metadata: { cateringRequestId: requestId.toString() },
    });

    await this.smsService.sendSms({
      to: request.contactPhone,
      body: `Pho Concept: Your catering event on ${formatDate(request.eventDate)} is confirmed! We look forward to serving you.`,
      template: 'catering_confirmed_sms',
      metadata: { cateringRequestId: requestId.toString() },
    });
  }

  private async handleExpireCheck(): Promise<void> {
    const now = new Date();

    const expiredRequests = await this.prisma.cateringRequest.findMany({
      where: {
        status: 'QUOTED',
        quotationDeadline: { lt: now },
        deletedAt: null,
      },
      select: { id: true, contactEmail: true, contactName: true },
    });

    if (expiredRequests.length === 0) return;

    const ids = expiredRequests.map((r) => r.id);
    await this.prisma.cateringRequest.updateMany({
      where: { id: { in: ids } },
      data: { status: 'CANCELLED' },
    });

    await Promise.allSettled(
      expiredRequests.map(async (request) => {
        await this.mailService.sendEmail({
          to: request.contactEmail,
          subject: 'Pho Concept — Catering Quote Expired',
          template: 'catering-cancelled',
          context: {
            contactName: request.contactName,
            isExpired: true,
          },
          metadata: { cateringRequestId: request.id.toString() },
        });
        this.logger.log(`Auto-cancelled expired catering request #${request.id}`);
      }),
    );
  }
}
