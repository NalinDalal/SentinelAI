export interface CrawlResult {
  url: string;
  finalUrl: string;
  html: string;
  dom: string;
  metadata: Record<string, string>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
  redirectChain: string[];
  scripts: string[];
  links: string[];
  forms: any[];
  images: string[];
  screenshotBase64: string | null;
  screenshotUrl: string | null;
  statusCode: number;
  contentType: string;
  sslInfo: Record<string, any>;
  ip: string;
  hostingInfo: Record<string, any>;
  timestamp: Date;
}

export interface IScanner {
  crawl(url: string): Promise<CrawlResult>;
}