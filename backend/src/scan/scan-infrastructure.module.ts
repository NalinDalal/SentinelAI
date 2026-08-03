import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScanWorker } from './scan-worker.service';
import { ScannerService } from '../../scanner/services/scanner.service';
import { UrlAnalyzerService } from '../../analyzer/url-analyzer/url-analyzer.service';
import { HtmlAnalyzerService } from '../../analyzer/html-analyzer/html-analyzer.service';
import { BrandDetectorService } from '../../analyzer/brand-detector/brand-detector.service';
import { OcrEngineService } from '../../analyzer/ocr-engine/ocr-engine.service';
import { LlmAnalyzerService } from '../../analyzer/llm-analyzer/llm-analyzer.service';
import { RiskEngineService } from '../../analyzer/risk-engine/risk-engine.service';
import { ScanService } from '../services/scan.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    ScanWorker,
    ScannerService,
    UrlAnalyzerService,
    HtmlAnalyzerService,
    BrandDetectorService,
    OcrEngineService,
    LlmAnalyzerService,
    RiskEngineService,
    ScanService,
  ],
  exports: [ScanWorker, ScannerService, UrlAnalyzerService, HtmlAnalyzerService, BrandDetectorService, OcrEngineService, LlmAnalyzerService, RiskEngineService, ScanService],
})
export class ScanInfrastructureModule {}