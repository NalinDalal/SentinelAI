import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScanQueueProcessor } from './scan-queue.processor';
import { ScanWorker } from './scan-worker.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueueAsync({
      name: 'scan',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        name: 'scan',
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string | undefined>('REDIS_PASSWORD'),
        },
      }),
    }),
  ],
  providers: [ScanQueueProcessor, ScanWorker],
})
export class ScanQueueModule {}