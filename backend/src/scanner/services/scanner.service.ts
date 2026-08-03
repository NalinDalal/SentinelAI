import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IScanner, CrawlResult } from '../../domain/interfaces/i-scanner';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ScannerService implements IScanner {
  private readonly logger = new Logger(ScannerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async crawl(url: string): Promise<CrawlResult> {
    this.logger.log(`Starting crawl for URL: ${url}`);

    const { chromium } = await import('playwright');
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
    });

    const context = await browser.newContext({
      javaScriptEnabled: true,
      ignoreHTTPSErrors: true,
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    const redirectChain: string[] = [];
    page.on('response', (response) => {
      const finalUrl = response.url();
      if (!redirectChain.includes(finalUrl)) {
        redirectChain.push(finalUrl);
      }
    });

    let screenshotBase64: string | null = null;
    let statusCode = 0;
    let contentType = '';

    try {
      const response = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      statusCode = response?.status() ?? 0;
      contentType = response?.headers()['content-type'] ?? '';

      const html = await page.content();
      const dom = await page.evaluate(() => document.documentElement.outerHTML);
      const metadata = await this.extractMetadata(page);
      const headers = await this.extractHeaders(response);
      const cookies = await this.extractCookies(context);
      const scripts = await this.extractScripts(page);
      const links = await this.extractLinks(page);
      const forms = await this.extractForms(page);
      const images = await this.extractImages(page);

      screenshotBase64 = await page.screenshot({ fullPage: true, type: 'png' });

      const sslInfo = await this.getSslInfo(url);
      const ip = await this.getIpAddress(url);
      const hostingInfo = await this.getHostingInfo(ip);

      const result: CrawlResult = {
        url,
        finalUrl: page.url(),
        html,
        dom,
        metadata,
        headers,
        cookies,
        redirectChain,
        scripts,
        links,
        forms,
        images,
        screenshotBase64,
        screenshotUrl: null,
        statusCode,
        contentType,
        sslInfo,
        ip,
        hostingInfo,
        timestamp: new Date(),
      };

      this.logger.log(`Crawl completed for URL: ${url}`);
      return result;
    } catch (error) {
      this.logger.error(`Crawl failed for URL: ${url}, Error: ${error}`);
      throw error;
    } finally {
      await browser.close();
    }
  }

  private async extractMetadata(page: any) {
    return page.evaluate(() => {
      const meta: Record<string, string> = {};
      const title = document.title;
      if (title) meta.title = title;

      const metaTags = document.querySelectorAll('meta');
      metaTags.forEach((tag) => {
        const name = tag.getAttribute('name') || tag.getAttribute('property');
        const content = tag.getAttribute('content');
        if (name && content) {
          meta[name] = content;
        }
      });

      return meta;
    });
  }

  private async extractHeaders(response: any) {
    const headers = response?.headers() ?? {};
    return headers;
  }

  private async extractCookies(context: any) {
    const cookies = await context.cookies();
    return cookies.reduce((acc: Record<string, string>, cookie: any) => {
      acc[cookie.name] = cookie.value;
      return acc;
    }, {});
  }

  private async extractScripts(page: any) {
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('script')).map((s) => ({
        src: s.getAttribute('src'),
        inline: s.textContent?.substring(0, 500) ?? '',
      }));
    });
  }

  private async extractLinks(page: any) {
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map((a) => ({
        href: a.getAttribute('href'),
        text: a.textContent?.substring(0, 100) ?? '',
      }));
    });
  }

  private async extractForms(page: any) {
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('form')).map((f) => ({
        action: f.getAttribute('action'),
        method: f.getAttribute('method') || 'GET',
        inputs: Array.from(f.querySelectorAll('input')).map((i) => ({
          name: i.getAttribute('name'),
          type: i.getAttribute('type'),
          value: i.getAttribute('value'),
        })),
      }));
    });
  }

  private async extractImages(page: any) {
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map((img) => ({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt'),
        width: img.width,
        height: img.height,
      }));
    });
  }

  private async getSslInfo(url: string) {
    try {
      const parsed = new URL(url);
      const https = parsed.protocol === 'https:';
      return {
        protocol: parsed.protocol,
        hasSsl: https,
        valid: https,
      };
    } catch {
      return { protocol: 'unknown', hasSsl: false, valid: false };
    }
  }

  private async getIpAddress(url: string): Promise<string> {
    try {
      const parsed = new URL(url);
      const dns = await import('dns').catch(() => null);
      if (dns) {
        const addresses = await dns.promises.lookup(parsed.hostname);
        return addresses.address;
      }
    } catch {
      // ignore
    }
    return '';
  }

  private async getHostingInfo(ip: string) {
    return { ip, provider: 'unknown', region: 'unknown' };
  }
}