import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [totalScans, phishingCount, suspiciousCount, safeCount, avgRisk] =
      await Promise.all([
        this.prisma.scan.count(),
        this.prisma.scan.count({ where: { verdict: 'phishing' } }),
        this.prisma.scan.count({ where: { verdict: 'suspicious' } }),
        this.prisma.scan.count({ where: { verdict: 'safe' } }),
        this.prisma.scan.aggregate({ _avg: { riskScore: true } }),
      ]);

    return {
      totalScans,
      phishingCount,
      suspiciousCount,
      safeCount,
      avgRiskScore: avgRisk._avg.riskScore ?? 0,
      phishingRate: totalScans > 0 ? (phishingCount / totalScans) * 100 : 0,
    };
  }

  async getTrend(days: number = 30) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const scans = await this.prisma.scan.findMany({
      where: { createdAt: { gte: fromDate } },
      select: {
        createdAt: true,
        riskScore: true,
        verdict: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return scans.map((s) => ({
      date: s.createdAt.toISOString().split('T')[0],
      riskScore: s.riskScore,
      verdict: s.verdict,
    }));
  }

  async getTopDomains(limit: number = 10) {
    const scans = await this.prisma.scan.findMany({
      where: { domain: { not: null } },
      select: { domain: true, riskScore: true, verdict: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const domainMap = new Map<string, { count: number; totalRisk: number; phishingCount: number }>();

    for (const scan of scans) {
      const domain = scan.domain!;
      const existing = domainMap.get(domain) ?? { count: 0, totalRisk: 0, phishingCount: 0 };
      existing.count++;
      existing.totalRisk += scan.riskScore;
      if (scan.verdict === 'phishing') existing.phishingCount++;
      domainMap.set(domain, existing);
    }

    return Array.from(domainMap.entries())
      .map(([domain, data]) => ({
        domain,
        scanCount: data.count,
        avgRiskScore: data.totalRisk / data.count,
        phishingCount: data.phishingCount,
      }))
      .sort((a, b) => b.avgRiskScore - a.avgRiskScore)
      .slice(0, limit);
  }
}