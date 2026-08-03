import { Scan } from '@prisma/client';
import { CreateScanDto } from '../dto/create-scan.dto';

export interface IScanRepository {
  create(data: CreateScanDto): Promise<Scan>;
  findById(id: string): Promise<Scan | null>;
  findAll(filters?: {
    status?: string;
    userId?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ scans: Scan[]; total: number }>;
  updateStatus(id: string, status: string): Promise<Scan>;
  updateResult(id: string, data: Partial<Scan>): Promise<Scan>;
  getStats(userId?: string): Promise<{
    totalScans: number;
    phishingCount: number;
    suspiciousCount: number;
    safeCount: number;
    avgRiskScore: number;
  }>;
  exportJson(userId?: string): Promise<Scan[]>;
}