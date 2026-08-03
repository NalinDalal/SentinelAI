import { Test, TestingModule } from '@nestjs/testing';
import { BrandDetectorService } from '../analyzer/brand-detector/brand-detector.service';

describe('BrandDetectorService', () => {
  let service: BrandDetectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrandDetectorService],
    }).compile();

    service = module.get<BrandDetectorService>(BrandDetectorService);
  });

  it('should detect Google brand in HTML', async () => {
    const html = '<html><body><img src="logo.google.com/logo.png">Sign in with Google</body></html>';
    const result = await service.detect(html, 'http://example.com');
    const googleBrand = result.detectedBrands.find((b) => b.name === 'Google');
    expect(googleBrand).toBeDefined();
  });

  it('should flag brand-domain mismatch as risky', async () => {
    const html = '<html><body><img src="logo.google.com/logo.png">Welcome to evil.com</body></html>';
    const result = await service.detect(html, 'http://evil.com');
    expect(result.riskScore).toBeGreaterThan(0);
  });

  it('should return low risk when no brands detected', async () => {
    const html = '<html><body><h1>My Personal Blog</h1></body></html>';
    const result = await service.detect(html, 'http://myblog.com');
    expect(result.riskScore).toBe(0);
  });
});