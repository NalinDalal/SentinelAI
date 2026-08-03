import { Injectable } from '@nestjs/common';
import { IBrandDetector, BrandDetectionResult, DetectedBrand } from '../../domain/interfaces/i-brand-detector';

@Injectable()
export class BrandDetectorService implements IBrandDetector {
  private readonly knownBrands = [
    {
      name: 'Google',
      patterns: ['google', 'gstatic', 'googleapis', 'googlesyndication'],
      domains: ['google.com', 'google.co.uk', 'google.de', 'google.fr', 'google.es'],
      logoPatterns: ['logo.google', 'google-logo', 'glogo'],
    },
    {
      name: 'Microsoft',
      patterns: ['microsoft', 'msft', 'windows', 'azure', 'live', 'outlook', 'office365'],
      domains: ['microsoft.com', 'microsoftonline.com', 'office.com'],
      logoPatterns: ['microsoft-logo', 'ms-logo', 'windows-logo'],
    },
    {
      name: 'Amazon',
      patterns: ['amazon', 'aws', 'amazonaws', 'amzn'],
      domains: ['amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.fr'],
      logoPatterns: ['amazon-logo', 'a-logo', 'aws-logo'],
    },
    {
      name: 'PayPal',
      patterns: ['paypal', 'paypal.com', 'paypalobjects'],
      domains: ['paypal.com', 'paypal.com.au', 'paypal.co.uk'],
      logoPatterns: ['paypal-logo', 'pp-logo', 'paypalobjects'],
    },
    {
      name: 'Facebook',
      patterns: ['facebook', 'fbcdn', 'facebook.net', 'meta'],
      domains: ['facebook.com', 'fb.com', 'messenger.com'],
      logoPatterns: ['facebook-logo', 'fb-logo'],
    },
    {
      name: 'GitHub',
      patterns: ['github', 'githubusercontent', 'githubapp'],
      domains: ['github.com', 'github.io'],
      logoPatterns: ['github-logo', 'octocat'],
    },
    {
      name: 'Apple',
      patterns: ['apple', 'icloud', 'icloud.com', 'apple.com'],
      domains: ['apple.com', 'icloud.com'],
      logoPatterns: ['apple-logo', 'apple-icon'],
    },
  ];

  async detect(html: string, url: string, screenshotBase64?: string): Promise<BrandDetectionResult> {
    const detectedBrands: DetectedBrand[] = [];
    const indicators: string[] = [];
    let totalRisk = 0;

    const lowerHtml = html.toLowerCase();
    const parsedUrl = new URL(url);
    const pageDomain = parsedUrl.hostname;

    for (const brand of this.knownBrands) {
      const textMatches = brand.patterns.filter((p) => lowerHtml.includes(p.toLowerCase()));
      const logoMatches = brand.logoPatterns.filter((p) => lowerHtml.includes(p.toLowerCase()));

      if (textMatches.length > 0 || logoMatches.length > 0) {
        const domainMatch = brand.domains.includes(pageDomain);
        const confidence = Math.min(1, (textMatches.length + logoMatches.length) / 5);

        detectedBrands.push({
          name: brand.name,
          logoUrls: logoMatches,
          textMatches,
          domainMatch,
          confidence,
        });

        if (!domainMatch) {
          indicators.push(`Brand "${brand.name}" detected but domain does not match official brand domain`);
          totalRisk += 20;
        } else {
          indicators.push(`Brand "${brand.name}" detected and domain matches`);
        }
      }
    }

    const riskScore = Math.min(totalRisk, 100);

    return {
      detectedBrands,
      riskScore,
      indicators,
    };
  }
}