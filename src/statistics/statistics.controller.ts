import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  async getDashboardStats() {
    console.log('📊 Backend - Dashboard stats requested');
    try {
      const stats = await this.statisticsService.getDashboardStats();
      console.log('✅ Dashboard stats:', stats);
      return {
        data: stats,
        message: 'Dashboard stats fetched successfully'
      };
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw error;
    }
  }

  @Get('top-books')
  async getTopBooks(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    const books = await this.statisticsService.getTopBooks(limitNum);
    return { data: books };
  }

  @Get('top-users')
  async getTopUsers(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    const users = await this.statisticsService.getTopUsers(limitNum);
    return { data: users };
  }

  @Get('book-statistics')
  async getBookStatistics() {
    const stats = await this.statisticsService.getBookStatistics();
    return { data: stats };
  }
}