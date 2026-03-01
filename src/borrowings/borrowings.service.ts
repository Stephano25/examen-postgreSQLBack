import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Borrowing } from '../entities/borrowing.entity';
import { BooksService } from '../books/books.service';

@Injectable()
export class BorrowingsService {
  constructor(
    @InjectRepository(Borrowing)
    private borrowingRepository: Repository<Borrowing>,
    private booksService: BooksService,
    private dataSource: DataSource,
  ) {}

  async borrowBook(userId: number, bookId: number): Promise<Borrowing> {
    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if book exists and has stock
      const book = await this.booksService.findOne(bookId);
      if (book.stock <= 0) {
        throw new BadRequestException('Book is not available');
      }

      // Check if user already has this book borrowed
      const existingBorrowing = await queryRunner.manager.findOne(Borrowing, {
        where: {
          user_id: userId,
          book_id: bookId,
          returned_at: null,
        },
      });

      if (existingBorrowing) {
        throw new BadRequestException('You already have this book borrowed');
      }

      // Create borrowing record
      const borrowing = queryRunner.manager.create(Borrowing, {
        user_id: userId,
        book_id: bookId,
        borrowed_at: new Date(),
      });

      await queryRunner.manager.save(borrowing);

      // Update book stock
      book.stock -= 1;
      await queryRunner.manager.save(book);

      // Commit transaction
      await queryRunner.commitTransaction();

      return borrowing;
    } catch (err) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async returnBook(userId: number, borrowingId: number): Promise<Borrowing> {
    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the borrowing
      const borrowing = await queryRunner.manager.findOne(Borrowing, {
        where: {
          id: borrowingId,
          user_id: userId,
          returned_at: null,
        },
        relations: ['book'],
      });

      if (!borrowing) {
        throw new NotFoundException('Borrowing record not found');
      }

      // Update borrowing record
      borrowing.returned_at = new Date();
      await queryRunner.manager.save(borrowing);

      // Update book stock
      borrowing.book.stock += 1;
      await queryRunner.manager.save(borrowing.book);

      // Commit transaction
      await queryRunner.commitTransaction();

      return borrowing;
    } catch (err) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async getUserBorrowings(userId: number): Promise<Borrowing[]> {
    return this.borrowingRepository.find({
      where: { user_id: userId },
      relations: ['book'],
      order: { borrowed_at: 'DESC' },
    });
  }

  async getAllBorrowings(): Promise<Borrowing[]> {
    return this.borrowingRepository.find({
      relations: ['user', 'book'],
      order: { borrowed_at: 'DESC' },
    });
  }
}