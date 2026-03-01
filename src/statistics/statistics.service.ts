import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../entities/book.entity';
import { User } from '../entities/user.entity';
import { Borrowing } from '../entities/borrowing.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Borrowing)
    private borrowingRepository: Repository<Borrowing>,
  ) {}

  async getTopBooks(limit: number = 5) {
    return this.bookRepository
      .createQueryBuilder('book')
      .leftJoin('book.borrowings', 'borrowing')
      .select([
        'book.id',
        'book.title',
        'book.author',
        'book.isbn',
        'book.stock',
        'COUNT(borrowing.id) as borrow_count',
      ])
      .groupBy('book.id')
      .orderBy('borrow_count', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getTopUsers(limit: number = 5) {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.borrowings', 'borrowing')
      .select([
        'user.id',
        'user.username',
        'user.role',
        'COUNT(borrowing.id) as borrow_count',
        'COUNT(CASE WHEN borrowing.returned_at IS NULL THEN 1 END) as active_borrowings',
      ])
      .where('user.role = :role', { role: 'user' })
      .groupBy('user.id')
      .orderBy('borrow_count', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getBookStatistics() {
    return this.bookRepository
      .createQueryBuilder('book')
      .leftJoin('book.borrowings', 'borrowing')
      .select([
        'book.id',
        'book.title',
        'COUNT(borrowing.id) as total_borrowings',
        'COUNT(CASE WHEN borrowing.returned_at IS NULL THEN 1 END) as currently_borrowed',
        'book.stock as available_stock',
      ])
      .groupBy('book.id')
      .orderBy('total_borrowings', 'DESC')
      .getRawMany();
  }

  async getDashboardStats() {
    const totalBooks = await this.bookRepository.count();
    const totalUsers = await this.userRepository.count();
    const activeBorrowings = await this.borrowingRepository.count({
      where: { returned_at: null },
    });
    const totalBorrowings = await this.borrowingRepository.count();

    return {
      totalBooks,
      totalUsers,
      activeBorrowings,
      totalBorrowings,
    };
  }
}