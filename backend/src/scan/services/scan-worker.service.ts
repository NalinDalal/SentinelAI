import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { ScannerService } from '../../scanner/services/scanner.service';
import { UrlAnalyzerService } from '../../analyzer/url-analyzer/url-analyzer.service';
import { HtmlAnalyzerService } from '../../analyzer/html-analyzer/html-analyzer.service';
import { BrandDetectorService } from '../../analyzer/brand-detector/brand-detector.service';
import { OcrEngineService } from '../../analyzer/ocr-engine/ocr-engine.service';
import { LlmAnalyzerService } from '../../analyzer/llm-analyzer/llm-analyzer.service';
import { RiskEngineService } from '../../analyzer/risk-engine/risk-engine.service';
import { ScanService } from '../../scan/services/scan.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ScanWorker {
  private readonly logger = new Logger(ScanWorker.name);

  constructor(
    @InjectQueue('scan') private readonly scanQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly scanner: ScannerService,
    private readonly urlAnalyzer: UrlAnalyzerService,
    private readonly htmlAnalyzer: HtmlAnalyzerService,
    private readonly brandDetector: BrandDetectorService,
    private readonly ocrEngine: OcrEngineService,
    private readonly llmAnalyzer: LlmAnalyzerService,
    private readonly riskEngine: RiskEngineService,
    private readonly scanService: ScanService,
  ) {}

  async processScan(scanId: string): Promise<void> {
    this.logger.log(`Processing scan ${scanId}`);

    const scan = await this.scanService.findById(scanId);
    if (!scan) {
      throw new Error(`Scan ${scanId} not found`);
    }

    try {
      await this.scanService.updateStatus(scanId, 'CRAWLING');
      const crawlResult = await this.scanner.crawl(scan.url);

      await this.scanService.updateResult(scanId, {
        status: 'ANALYZING',
        finalUrl: crawlResult.finalUrl,
        html: crawlResult.html,
        metadata: crawlResult.metadata,
        headers: crawlResult.headers,
        cookies: crawlResult.cookies,
        redirectChain: crawlResult.redirectChain,
        screenshotUrl: crawlResult.screenshotUrl,
        ip: crawlResult.ip,
        hostingInfo: crawlResult.hostingInfo,
        sslInfo: crawlResult.sslInfo,
      });

      await this.scanService.updateStatus(scanId, 'ANALYZING');

      const urlAnalysis = await this.urlAnalyzer.analyze(scan.url);
      const htmlAnalysis = await this.htmlAnalyzer.analyze(crawlResult.html, scan.url);
      const brandDetection = await this.brandDetector.detect(crawlResult.html, scan.url, crawlResult.screenshotBase64 ?? undefined);

      let ocrResult = null;
      if (crawlResult.screenshotBase64) {
        const buffer = Buffer.from(crawlResult.screenshotBase64, 'base64');
        ocrResult = await this.ocrEngine.extractText(buffer);
      }

      const llmInput = {
        url: scan.url,
        urlAnalysis,
        htmlAnalysis,
        ocrResult,
        brandDetection,
        metadata: crawlResult.metadata,
        headers: crawlResult.headers,
        redirectChain: crawlResult.redirectChain,
        sslInfo: crawlResult.sslInfo,
      };

      await this.scanService.updateStatus(scanId, 'LLM_PROCESSING');
      const llmResult = await this.llmAnalyzer.analyze(llmInput);

      const riskInput = {
        llmScore: llmResult.riskScore,
        urlScore: urlAnalysis.riskScore,
        ocrScore: ocrResult?.riskScore ?? 0,
        htmlScore: htmlAnalysis.riskScore,
        brandScore: brandDetection.riskScore,
      };

      const riskResult = this.riskEngine.calculate(riskInput);

      await this.scanService.updateResult(scanId, {
        status: 'COMPLETED',
        domain: crawlResult.finalUrl ? new URL(crawlResult.finalUrl).hostname : scan.domain,
        title: crawlResult.metadata.title ?? null,
        riskScore: riskResult.finalScore,
        confidence: riskResult.confidence,
        verdict: riskResult.verdict,
        recommendation: llmResult.recommendedAction,
        llmResponse: llmResult,
        urlAnalysis,
        htmlAnalysis,
        ocrResult,
        brandDetection,
      });

      this.logger.log(`Scan ${scanId} completed with verdict: ${riskResult.verdict}`);
    } catch (error) {
      this.logger.error(`Scan ${scanId} failed: ${error}`);
      await this.scanService.updateStatus(scanId, 'FAILED');
      throw error;
    }
  }
}