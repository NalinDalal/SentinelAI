import { Test, TestingModule } from '@nestjs/testing';
import { UrlAnalyzerService } from '../analyzer/url-analyzer/url-analyzer.service';

describe('UrlAnalyzerService', () => {
  let service: UrlAnalyzerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UrlAnalyzerService],
    }).compile();

    service = module.get<UrlAnalyzerService>(UrlAnalyzerService);
  });

  it('should detect IP address URLs as risky', async () => {
    const result = await service.analyze('http://192.168.1.1/login');
    expect(result.isIpAddress).toBe(true);
    expect(result.riskScore).toBeGreaterThan(0);
  });

  it('should detect suspicious TLDs', async () => {
    const result = await service.analyze('http://example.tk/login');
    expect(result.hasSuspiciousTld).toBe(true);
    expect(result.riskScore).toBeGreaterThan(0);
  });

  it('should detect URL shortening services', async () => {
    const result = await service.analyze('http://bit.ly/3xYz123');
    expect(result.isUrlShortened).toBe(true);
    expect(result.riskScore).toBeGreaterThan(0);
  });

  it('should detect suspicious keywords', async () => {
    const result = await service.analyze('http://example.com/verify-account-now');
    expect(result.hasSuspiciousKeywords).toBe(true);
    expect(result.riskScore).toBeGreaterThan(0);
  });

  it('should return low risk for legitimate URLs', async () => {
    const result = await service.analyze('https://www.google.com/search?q=hello');
    expect(result.riskScore).toBeLessThan(30);
  });

  it('should calculate entropy correctly', async () => {
    const result = await service.analyze('http://example.com/abc123xyz');
    expect(result.entropy).toBeGreaterThan(0);
  });
});