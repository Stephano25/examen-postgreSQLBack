import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Book } from '../entities/book.entity';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  async findAll(search?: string): Promise<Book[]> {
    if (search) {
      return this.bookRepository.find({
        where: [
          { title: Like(`%${search}%`) },
          { author: Like(`%${search}%`) },
          { isbn: Like(`%${search}%`) },
        ],
        order: { title: 'ASC' },
      });
    }
    return this.bookRepository.find({
      order: { title: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({ 
      where: { id },
      relations: ['borrowings'],
    });
    
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const book = this.bookRepository.create(createBookDto);
    return this.bookRepository.save(book);
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);
    
    Object.assign(book, updateBookDto);
    return this.bookRepository.save(book);
  }

  async remove(id: number): Promise<void> {
    const result = await this.bookRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
  }

  async updateStock(id: number, change: number): Promise<Book> {
    const book = await this.findOne(id);
    book.stock += change;
    
    if (book.stock < 0) {
      throw new Error('Insufficient stock');
    }
    
    return this.bookRepository.save(book);
  }
}