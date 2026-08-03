import { Test, TestingModule } from '@nestjs/testing';
import { RiskEngineService } from '../analyzer/risk-engine/risk-engine.service';

describe('RiskEngineService', () => {
  let service: RiskEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiskEngineService],
    }).compile();

    service = module.get<RiskEngineService>(RiskEngineService);
  });

  it('should return safe verdict for low scores', () => {
    const result = service.calculate({ llmScore: 5, urlScore: 5, ocrScore: 5, htmlScore: 5, brandScore: 5 });
    expect(result.verdict).toBe('safe');
    expect(result.finalScore).toBeLessThan(25);
  });

  it('should return suspicious verdict for medium scores', () => {
    const result = service.calculate({ llmScore: 40, urlScore: 35, ocrScore: 30, htmlScore: 45, brandScore: 25 });
    expect(result.verdict).toBe('suspicious');
  });

  it('should return phishing verdict for high scores', () => {
    const result = service.calculate({ llmScore: 70, urlScore: 80, ocrScore: 60, htmlScore: 75, brandScore: 65 });
    expect(result.verdict).toBe('phishing');
  });

  it('should return high-risk verdict for very high scores', () => {
    const result = service.calculate({ llmScore: 90, urlScore: 95, ocrScore: 85, htmlScore: 92, brandScore: 88 });
    expect(result.verdict).toBe('high-risk');
  });

  it('should calculate confidence based on score variance', () => {
    const result = service.calculate({ llmScore: 50, urlScore: 50, ocrScore: 50, htmlScore: 50, brandScore: 50 });
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('should clamp score between 0 and 100', () => {
    const result = service.calculate({ llmScore: 150, urlScore: 200, ocrScore: 100, htmlScore: 150, brandScore: 100 });
    expect(result.finalScore).toBeLessThanOrEqual(100);
    expect(result.finalScore).toBeGreaterThanOrEqual(0);
  });
});