import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './services/dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  async getOverview() {
    return { data: await this.dashboardService.getOverview() };
  }

  @Get('trend')
  async getTrend(@Query('days') days?: string) {
    return { data: await this.dashboardService.getTrend(parseInt(days || '30', 10)) };
  }

  @Get('top-domains')
  async getTopDomains(@Query('limit') limit?: string) {
    return { data: await this.dashboardService.getTopDomains(parseInt(limit || '10', 10)) };
  }
}