import { Test, TestingModule } from '@nestjs/testing';
import { HtmlAnalyzerService } from '../analyzer/html-analyzer/html-analyzer.service';

describe('HtmlAnalyzerService', () => {
  let service: HtmlAnalyzerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HtmlAnalyzerService],
    }).compile();

    service = module.get<HtmlAnalyzerService>(HtmlAnalyzerService);
  });

  it('should detect hidden input fields', async () => {
    const html = '<html><body><form><input type="hidden" name="token" value="abc123"></form></body></html>';
    const result = await service.analyze(html, 'http://example.com');
    expect(result.hasHiddenInputs).toBe(true);
  });

  it('should detect password fields', async () => {
    const html = '<html><body><form><input type="password" name="password"></form></body></html>';
    const result = await service.analyze(html, 'http://example.com');
    expect(result.hasPasswordFields).toBe(true);
  });

  it('should detect meta refresh redirects', async () => {
    const html = '<html><head><meta http-equiv="refresh" content="0;url=http://evil.com"></head></html>';
    const result = await service.analyze(html, 'http://example.com');
    expect(result.hasMetaRefresh).toBe(true);
  });

  it('should detect Base64 payloads', async () => {
    const html = '<html><body><script>eval(atob("ZG9jdW1lbnQud3JpdGUoJ2hlbGxvJyk="))</script></body></html>';
    const result = await service.analyze(html, 'http://example.com');
    expect(result.hasBase64Payloads).toBe(true);
  });

  it('should detect obfuscated JavaScript', async () => {
    const html = '<html><body><script>eval("alert(1)")</script></body></html>';
    const result = await service.analyze(html, 'http://example.com');
    expect(result.hasObfuscatedJavaScript).toBe(true);
  });

  it('should return low risk for clean HTML', async () => {
    const html = '<html><body><h1>Hello World</h1><p>This is a legitimate page.</p></body></html>';
    const result = await service.analyze(html, 'http://example.com');
    expect(result.riskScore).toBe(0);
  });
});