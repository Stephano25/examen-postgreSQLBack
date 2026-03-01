import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowingsService } from './borrowings.service';
import { BorrowingsController } from './borrowings.controller';
import { Borrowing } from '../entities/borrowing.entity';
import { BooksModule } from '../books/books.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Borrowing]),
    BooksModule,
  ],
  providers: [BorrowingsService],
  controllers: [BorrowingsController],
})
export class BorrowingsModule {}