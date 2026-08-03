import { Injectable, Logger } from '@nestjs/common';
import { Events, Queue, Worker } from 'bullmq';
import { IQueue } from 'bullmq';
import { ScanWorker } from './scan-worker.service';
import { ScanService } from '../services/scan.service';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ScanQueueProcessor {
  private readonly logger = new Logger(ScanQueueProcessor.name);
  private worker: Worker | null = null;

  constructor(
    private readonly scanWorker: ScanWorker,
    private readonly scanService: ScanService,
    private readonly prisma: PrismaService,
  ) {}

  async init(): Promise<void> {
    this.worker = new Worker(
      'scan',
      async (job) => {
        const { scanId } = job.data;
        this.logger.log(`Processing job ${job.id} for scan ${scanId}`);
        await this.scanWorker.processScan(scanId);
      },
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
        },
        concurrency: 5,
      },
    );

    this.worker.on(Events.COMPLETED, (job) => {
      this.logger.log(`Job ${job.id} completed`);
    });

    this.worker.on(Events.FAILED, (job, err) => {
      this.logger.error(`Job ${job?.id} failed: ${err.message}`);
    });
  }

  async addScan(scanId: string): Promise<void> {
    if (!this.worker) {
      await this.init();
    }

    const queue = new Queue('scan', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    });

    await queue.add('scan', { scanId }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
  }
}