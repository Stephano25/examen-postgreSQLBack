import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { Book } from '../entities/book.entity';
import { User } from '../entities/user.entity';
import { Borrowing } from '../entities/borrowing.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, User, Borrowing]),
  ],
  providers: [StatisticsService],
  controllers: [StatisticsController],
})
export class StatisticsModule {}