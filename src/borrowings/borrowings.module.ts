import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowingsService } from './borrowings.service';
import { BorrowingsController } from './borrowings.controller';
import { Borrowing } from '../entities/borrowing.entity';
import { Book } from '../entities/book.entity';  // Ajouter l'import
import { User } from '../entities/user.entity';   // Ajouter l'import

@Module({
  imports: [
    TypeOrmModule.forFeature([Borrowing, Book, User])  // Ajouter Book et User
  ],
  providers: [BorrowingsService],
  controllers: [BorrowingsController],
  exports: [BorrowingsService]
})
export class BorrowingsModule {}