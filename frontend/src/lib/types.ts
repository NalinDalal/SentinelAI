export interface Scan {
  id: string;
  url: string;
  domain: string;
  status: string;
  riskScore: number;
  confidence: number;
  verdict: string | null;
  recommendation: string | null;
  createdAt: string;
}

export interface ScanResult {
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
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalScans: number;
  phishingCount: number;
  suspiciousCount: number;
  safeCount: number;
  avgRiskScore: number;
  phishingRate: number;
}

export interface TrendPoint {
  date: string;
  riskScore: number;
  verdict: string | null;
}

export interface TopDomain {
  domain: string;
  scanCount: number;
  avgRiskScore: number;
  phishingCount: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}