import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getHistory(filters?: {
    userId?: string;
    status?: string;
    verdict?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const { userId, status, verdict, startDate, endDate, page = 1, limit = 20, search } = filters || {};

    const where: any = {};

    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (verdict) where.verdict = verdict;
    if (search) where.url = { contains: search, mode: 'insensitive' };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [scans, total] = await Promise.all([
      this.prisma.scan.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true, role: true } } },
      }),
      this.prisma.scan.count({ where }),
    ]);

    return { scans, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getScanById(id: string) {
    const scan = await this.prisma.scan.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, role: true } } },
    });

    if (!scan) {
      throw new NotFoundException(`Scan with id ${id} not found`);
    }

    return scan;
  }

  async exportScans(filters?: { userId?: string; format?: string }) {
    const scans = await this.prisma.scan.findMany({
      where: filters?.userId ? { userId: filters.userId } : {},
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });

    if (filters?.format === 'csv') {
      return this.toCsv(scans);
    }

    return scans;
  }

  private toCsv(scans: any[]): string {
    const headers = ['id', 'url', 'domain', 'status', 'riskScore', 'confidence', 'verdict', 'createdAt'];
    const rows = scans.map((s) =>
      headers.map((h) => {
        const val = (s as any)[h];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return JSON.stringify(val).replace(/"/g, '""');
        return String(val);
      }).join(','),
    );

    return [headers.join(','), ...rows].join('\n');
  }
}