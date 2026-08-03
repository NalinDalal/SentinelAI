export interface UrlAnalysisResult {
  url: string;
  domain: string;
  subdomainCount: number;
  pathDepth: number;
  queryParamCount: number;
  isIpAddress: boolean;
  isUrlShortened: boolean;
  hasSuspiciousTld: boolean;
  hasRandomString: boolean;
  hasExcessiveSymbols: boolean;
  hasSuspiciousKeywords: boolean;
  tldRiskScore: number;
  urlLength: number;
  entropy: number;
  riskScore: number;
  indicators: string[];
}

export interface IUrlAnalyzer {
  analyze(url: string): Promise<UrlAnalysisResult>;
}