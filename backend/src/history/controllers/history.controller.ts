import { Controller, Get, Query, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { HistoryService } from './services/history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  async list(
    @Query('status') status?: string,
    @Query('verdict') verdict?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('userId') userId?: string,
  ) {
    const result = await this.historyService.getHistory({
      status,
      verdict,
      startDate,
      endDate,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
      userId,
    });
    return { data: result.scans, pagination: result.pagination };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return { data: await this.historyService.getScanById(id) };
  }

  @Get('export')
  async export(
    @Query('format') format?: string,
    @Query('userId') userId?: string,
    @Res() res: Response,
  ) {
    const data = await this.historyService.exportScans({ userId, format });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=scan-history.csv');
      return res.send(data);
    }

    return { data };
  }
}