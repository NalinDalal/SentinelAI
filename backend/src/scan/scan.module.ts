import { Module } from '@nestjs/common';
import { ScanController } from './controllers/scan.controller';
import { ScanService } from './services/scan.service';
import { ScanWorker } from './services/scan-worker.service';
import { ScanQueueProcessor } from './services/scan-queue.processor';
import { PrismaModule } from '../../database/prisma.module';
import { BullMQModule } from '../../modules/bullmq.module';
import { ScanQueueModule } from './scan-queue.module';

@Module({
  imports: [PrismaModule, BullMQModule, ScanQueueModule],
  controllers: [ScanController],
  providers: [ScanService, ScanWorker, ScanQueueProcessor],
  exports: [ScanService, ScanWorker, ScanQueueProcessor],
})
export class ScanModule {}