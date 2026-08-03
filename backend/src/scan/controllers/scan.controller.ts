import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ScanService } from '../services/scan.service';
import { CreateScanDto } from '../dto/create-scan.dto';
import { ScanResponseDto } from '../dto/scan-response.dto';
import { ScanResultDto } from '../dto/scan-result.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('scan')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @Roles('USER', 'ADMIN')
  async createScan(@Body() dto: CreateScanDto, @CurrentUser() user: any) {
    const scan = await this.scanService.create({
      ...dto,
      userId: user.id,
    });
    return { data: scan, message: 'Scan queued successfully' };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getScan(@Param('id') id: string) {
    const scan = await this.scanService.findById(id);
    if (!scan) {
      throw new Error('Scan not found');
    }
    return { data: scan };
  }

  @Get('history')
  @UseGuards(AuthGuard('jwt'))
  async getHistory(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @CurrentUser() user: any,
  ) {
    const result = await this.scanService.findAll({
      status,
      userId: user.id,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
    });
    return { data: result.scans, pagination: { total: result.total, page: parseInt(page || '1', 10), limit: parseInt(limit || '20', 10) } };
  }

  @Get('dashboard')
  @UseGuards(AuthGuard('jwt'))
  async getDashboard(@CurrentUser() user: any) {
    const stats = await this.scanService.getStats(user.id);
    const recentScans = await this.scanService.findAll({
      userId: user.id,
      page: 1,
      limit: 10,
    });
    return { stats, recentScans: recentScans.scans };
  }

  @Get('export')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async exportScans(@CurrentUser() user: any) {
    const scans = await this.scanService.exportJson(user.id);
    return { data: scans };
  }
}