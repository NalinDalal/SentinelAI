export interface BrandDetectionResult {
  detectedBrands: DetectedBrand[];
  riskScore: number;
  indicators: string[];
}

export interface DetectedBrand {
  name: string;
  logoUrls: string[];
  textMatches: string[];
  domainMatch: boolean;
  confidence: number;
}

export interface IBrandDetector {
  detect(html: string, url: string, screenshotBase64?: string): Promise<BrandDetectionResult>;
}