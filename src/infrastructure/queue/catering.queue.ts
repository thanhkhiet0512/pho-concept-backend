import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export type CateringJobType =
  | { type: 'inquiry_received'; requestId: string }
  | { type: 'quote_sent';       requestId: string }
  | { type: 'status_changed';   requestId: string; newStatus: string }
  | { type: 'expire_check' };

const JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 2000 },
  removeOnComplete: { age: 3600 },
  removeOnFail: { age: 86400 },
};

const EXPIRE_CHECK_CRON = '0 * * * *';

@Injectable()
export class CateringQueue {
  constructor(@InjectQueue('catering-queue') private readonly queue: Queue) {}

  async addInquiryReceived(requestId: bigint): Promise<void> {
    await this.queue.add('catering', { type: 'inquiry_received', requestId: requestId.toString() }, JOB_OPTIONS);
  }

  async addQuoteSent(requestId: bigint): Promise<void> {
    await this.queue.add('catering', { type: 'quote_sent', requestId: requestId.toString() }, JOB_OPTIONS);
  }

  async addStatusChanged(requestId: bigint, newStatus: string): Promise<void> {
    await this.queue.add('catering', { type: 'status_changed', requestId: requestId.toString(), newStatus }, JOB_OPTIONS);
  }

  async ensureExpireCheck(): Promise<void> {
    const repeatableJobs = await this.queue.getRepeatableJobs();
    const alreadyRegistered = repeatableJobs.some((job) => job.pattern === EXPIRE_CHECK_CRON);
    if (alreadyRegistered) return;

    await this.queue.add(
      'catering',
      { type: 'expire_check' },
      { repeat: { pattern: EXPIRE_CHECK_CRON } },
    );
  }
}
