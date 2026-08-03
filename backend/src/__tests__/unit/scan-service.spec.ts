import { Test, TestingModule } from '@nestjs/testing';
import { ScanService } from '../scan/services/scan.service';
import { PrismaService } from '../../database/prisma.service';

jest.mock('../../database/prisma.service');

describe('ScanService', () => {
  let service: ScanService;
  const mockPrisma = {
    scan: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScanService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ScanService>(ScanService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a scan', async () => {
    mockPrisma.scan.create.mockResolvedValue({
      id: 'test-id',
      url: 'http://example.com',
      domain: 'example.com',
      status: 'PENDING',
      riskScore: 0,
      confidence: 0,
    });

    const result = await service.create({ url: 'http://example.com' });
    expect(result.url).toBe('http://example.com');
    expect(mockPrisma.scan.create).toHaveBeenCalled();
  });

  it('should find a scan by ID', async () => {
    mockPrisma.scan.findUnique.mockResolvedValue({
      id: 'test-id',
      url: 'http://example.com',
      domain: 'example.com',
      status: 'COMPLETED',
      riskScore: 85,
      confidence: 0.95,
      verdict: 'phishing',
    });

    const result = await service.findById('test-id');
    expect(result?.url).toBe('http://example.com');
  });

  it('should return null for non-existent scan', async () => {
    mockPrisma.scan.findUnique.mockResolvedValue(null);
    const result = await service.findById('non-existent');
    expect(result).toBeNull();
  });

  it('should get stats', async () => {
    mockPrisma.scan.count.mockResolvedValue(100);
    mockPrisma.scan.aggregate.mockResolvedValue({ _avg: { riskScore: 45.5 } });

    const result = await service.getStats();
    expect(result.totalScans).toBe(100);
  });
});