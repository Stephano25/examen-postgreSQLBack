import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const book = await this.booksService.findOne(bookId);
      if (book.stock <= 0) {
        throw new BadRequestException('Book is not available');
      }

      const existingBorrowing = await queryRunner.manager.findOne(Borrowing, {
        where: {
          user_id: userId,
          book_id: bookId,
          returned_at: IsNull()
        }
      });

      if (existingBorrowing) {
        throw new BadRequestException('You already have this book borrowed');
      }

      const borrowing = queryRunner.manager.create(Borrowing, {
        user_id: userId,
        book_id: bookId,
        borrowed_at: new Date()
      });

      await queryRunner.manager.save(borrowing);
      book.stock -= 1;
      await queryRunner.manager.save(book);
      await queryRunner.commitTransaction();

      return borrowing;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async returnBook(userId: number, borrowingId: number): Promise<Borrowing> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const borrowing = await queryRunner.manager.findOne(Borrowing, {
        where: {
          id: borrowingId,
          user_id: userId,
          returned_at: IsNull()
        },
        relations: ['book']
      });

      if (!borrowing) {
        throw new NotFoundException('Borrowing record not found');
      }

      borrowing.returned_at = new Date();
      await queryRunner.manager.save(borrowing);

      if (borrowing.book) {
        borrowing.book.stock += 1;
        await queryRunner.manager.save(borrowing.book);
      }

      await queryRunner.commitTransaction();
      return borrowing;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // === MÉTHODES AJOUTÉES ICI ===
  async getUserBorrowings(userId: number): Promise<Borrowing[]> {
    return this.borrowingRepository.find({
      where: { user_id: userId },
      relations: ['book'],
      order: { borrowed_at: 'DESC' }
    });
  }

  async getAllBorrowings(): Promise<Borrowing[]> {
    return this.borrowingRepository.find({
      relations: ['user', 'book'],
      order: { borrowed_at: 'DESC' }
    });
  }
  // === FIN DES MÉTHODES AJOUTÉES ===
}