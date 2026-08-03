export interface LlmAnalysisInput {
  url: string;
  urlAnalysis: any;
  htmlAnalysis: any;
  ocrResult: any;
  brandDetection: any;
  metadata: any;
  headers: any;
  redirectChain: any;
  sslInfo: any;
}

export interface LlmAnalysisResult {
  classification: 'phishing' | 'suspicious' | 'legitimate' | 'unknown';
  confidence: number;
  riskScore: number;
  explanation: string;
  reasons: string[];
  detectedPatterns: string[];
  recommendedAction: string;
}

export interface ILlmAnalyzer {
  analyze(input: LlmAnalysisInput): Promise<LlmAnalysisResult>;
}