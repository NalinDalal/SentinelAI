export interface OcrResult {
  text: string;
  confidence: number;
  language: string;
  wordCount: number;
  suspiciousPhrases: string[];
  riskScore: number;
}

export interface IOcrEngine {
  extractText(imageBuffer: Buffer): Promise<OcrResult>;
}