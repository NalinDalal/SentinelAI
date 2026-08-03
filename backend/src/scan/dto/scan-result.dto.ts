export class ScanResultDto {
  id: string;
  url: string;
  domain: string;
  ip: string | null;
  title: string | null;
  status: string;
  riskScore: number;
  confidence: number;
  verdict: string | null;
  recommendation: string | null;
  llmResponse: Record<string, unknown> | null;
  urlAnalysis: Record<string, unknown> | null;
  htmlAnalysis: Record<string, unknown> | null;
  ocrResult: Record<string, unknown> | null;
  brandDetection: Record<string, unknown> | null;
  screenshotUrl: string | null;
  metadata: Record<string, unknown> | null;
  redirectChain: string[] | null;
  headers: Record<string, unknown> | null;
  cookies: Record<string, unknown> | null;
  sslInfo: Record<string, unknown> | null;
  hostingInfo: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}