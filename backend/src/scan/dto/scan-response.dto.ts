export class ScanResponseDto {
  id: string;
  url: string;
  domain: string;
  status: string;
  riskScore: number;
  confidence: number;
  verdict: string | null;
  recommendation: string | null;
  createdAt: Date;
}