import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateScanDto } from '../dto/create-scan.dto';
import { Scan } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { IScanRepository } from '../interfaces/scan-repository.interface';

@Injectable()
export class ScanService implements IScanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateScanDto): Promise<Scan> {
    const scan = await this.prisma.scan.create({
      data: {
        id: uuid(),
        url: data.url,
        domain: this.extractDomain(data.url),
        status: 'PENDING',
        riskScore: 0,
        confidence: 0,
      },
    });

    return scan;
  }

  async findById(id: string): Promise<Scan | null> {
    return this.prisma.scan.findUnique({ where: { id } });
  }

  async findAll(filters?: {
    status?: string;
    userId?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ scans: Scan[]; total: number }> {
    const { status, userId, page = 1, limit = 20, search } = filters || {};

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.url = { contains: search, mode: 'insensitive' };
    }

    const [scans, total] = await Promise.all([
      this.prisma.scan.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.scan.count({ where }),
    ]);

    return { scans, total };
  }

  async updateStatus(id: string, status: string): Promise<Scan> {
    return this.prisma.scan.update({
      where: { id },
      data: { status },
    });
  }

  async updateResult(id: string, data: Partial<Scan>): Promise<Scan> {
    return this.prisma.scan.update({
      where: { id },
      data,
    });
  }

  async getStats(userId?: string): Promise<{
    totalScans: number;
    phishingCount: number;
    suspiciousCount: number;
    safeCount: number;
    avgRiskScore: number;
  }> {
    const where = userId ? { userId } : {};

    const [totalScans, phishingCount, suspiciousCount, safeCount, avgResult] =
      await Promise.all([
        this.prisma.scan.count({ where }),
        this.prisma.scan.count({ where: { ...where, verdict: 'phishing' } }),
        this.prisma.scan.count({ where: { ...where, verdict: 'suspicious' } }),
        this.prisma.scan.count({ where: { ...where, verdict: 'safe' } }),
        this.prisma.scan.aggregate({
          where,
          _avg: { riskScore: true },
        }),
      ]);

    return {
      totalScans,
      phishingCount,
      suspiciousCount,
      safeCount,
      avgRiskScore: avgResult._avg.riskScore ?? 0,
    };
  }

  async exportJson(userId?: string): Promise<Scan[]> {
    const where = userId ? { userId } : {};
    return this.prisma.scan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });
  }

  private extractDomain(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return url;
    }
  }
}