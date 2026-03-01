import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('top-books')
  async getTopBooks(@Query('limit') limit?: string) {
    return this.statisticsService.getTopBooks(limit ? parseInt(limit) : 5);
  }

  @Get('top-users')
  async getTopUsers(@Query('limit') limit?: string) {
    return this.statisticsService.getTopUsers(limit ? parseInt(limit) : 5);
  }

  @Get('book-statistics')
  async getBookStatistics() {
    return this.statisticsService.getBookStatistics();
  }

  @Get('dashboard')
  async getDashboardStats() {
    return this.statisticsService.getDashboardStats();
  }
}