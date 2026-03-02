import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { Borrowing } from '../entities/borrowing.entity';
import { Book } from '../entities/book.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class BorrowingsService {
  constructor(
    @InjectRepository(Borrowing)
    private borrowingRepository: Repository<Borrowing>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async borrowBook(userId: number, bookId: number): Promise<Borrowing> {
    console.log(`📚 Tentative d'emprunt - User: ${userId}, Book: ${bookId}`);
    
    // Vérifier que l'utilisateur existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Vérifier que le livre existe
    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    // Vérifier le stock
    if (book.stock <= 0) {
      throw new BadRequestException('Book is not available');
    }

    // Vérifier si l'utilisateur a déjà emprunté ce livre
    const existingBorrowing = await this.borrowingRepository.findOne({
      where: {
        user_id: userId,
        book_id: bookId,
        returned_at: IsNull()
      }
    });

    if (existingBorrowing) {
      throw new BadRequestException('You already have this book borrowed');
    }

    // Utiliser une transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Créer l'emprunt
      const borrowing = queryRunner.manager.create(Borrowing, {
        user_id: userId,
        book_id: bookId,
        borrowed_at: new Date()
      });
      await queryRunner.manager.save(borrowing);

      // RÉDUIRE LE STOCK DU LIVRE
      book.stock -= 1;
      await queryRunner.manager.save(book);

      // Commit transaction
      await queryRunner.commitTransaction();
      
      console.log(`✅ Emprunt réussi - ID: ${borrowing.id}, Nouveau stock: ${book.stock}`);
      
      // Récupérer l'emprunt avec les relations
      const savedBorrowing = await this.borrowingRepository.findOne({
        where: { id: borrowing.id },
        relations: ['book', 'user']
      });
      
      if (!savedBorrowing) {
        throw new InternalServerErrorException('Failed to retrieve borrowed book');
      }
      
      return savedBorrowing;

    } catch (err) {
      // Rollback en cas d'erreur
      await queryRunner.rollbackTransaction();
      console.error('❌ Erreur lors de l\'emprunt:', err);
      throw new InternalServerErrorException('Failed to borrow book');
    } finally {
      await queryRunner.release();
    }
  }

  async returnBook(userId: number, borrowingId: number): Promise<Borrowing> {
    console.log(`📚 Tentative de retour - User: ${userId}, Borrowing: ${borrowingId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Trouver l'emprunt
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

      // Mettre à jour la date de retour
      borrowing.returned_at = new Date();
      await queryRunner.manager.save(borrowing);

      // AUGMENTER LE STOCK DU LIVRE
      if (borrowing.book) {
        borrowing.book.stock += 1;
        await queryRunner.manager.save(borrowing.book);
        console.log(`✅ Stock du livre ${borrowing.book.title} augmenté à ${borrowing.book.stock}`);
      }

      await queryRunner.commitTransaction();
      
      console.log(`✅ Retour réussi - Borrowing: ${borrowingId}`);
      
      const savedBorrowing = await this.borrowingRepository.findOne({
        where: { id: borrowingId },
        relations: ['book', 'user']
      });
      
      if (!savedBorrowing) {
        throw new InternalServerErrorException('Failed to retrieve returned book');
      }
      
      return savedBorrowing;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Erreur lors du retour:', err);
      throw new InternalServerErrorException('Failed to return book');
    } finally {
      await queryRunner.release();
    }
  }

  async getUserBorrowings(userId: number): Promise<Borrowing[]> {
    console.log(`📚 Récupération emprunts pour user ${userId}`);
    
    const borrowings = await this.borrowingRepository.find({
      where: { user_id: userId },
      relations: ['book'],
      order: { borrowed_at: 'DESC' }
    });
    
    console.log(`✅ ${borrowings.length} emprunts trouvés`);
    return borrowings;
  }

  async getAllBorrowings(): Promise<Borrowing[]> {
    console.log('📚 Backend - Récupération de TOUS les emprunts');
    
    const borrowings = await this.borrowingRepository.find({
      relations: ['user', 'book'],
      order: { borrowed_at: 'DESC' }
    });
    
    console.log(`✅ ${borrowings.length} emprunts trouvés`);
    return borrowings;
  }
}