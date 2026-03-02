import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  Req,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { BorrowingsService } from './borrowings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// DTO simples sans décorateurs (la validation se fait dans le service)
class BorrowDto {
  book_id: number;
}

class ReturnDto {
  borrowing_id: number;
}

@Controller('borrowings')
@UseGuards(JwtAuthGuard)
export class BorrowingsController {
  constructor(private readonly borrowingsService: BorrowingsService) {}

  @Post('borrow')
  async borrowBook(@Req() req, @Body() borrowDto: BorrowDto) {
    console.log('📨 Requête emprunt reçue:', {
      userId: req.user?.id,
      bookId: borrowDto?.book_id
    });

    // Validation simple
    if (!borrowDto || typeof borrowDto.book_id !== 'number') {
      throw new HttpException(
        { message: 'book_id must be a number' },
        HttpStatus.BAD_REQUEST
      );
    }

    if (!req.user?.id) {
      throw new HttpException(
        { message: 'User not authenticated' },
        HttpStatus.UNAUTHORIZED
      );
    }

    try {
      const result = await this.borrowingsService.borrowBook(req.user.id, borrowDto.book_id);
      return { data: result, message: 'Book borrowed successfully' };
    } catch (error) {
      console.error('❌ Erreur emprunt:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        { message: error.message || 'Failed to borrow book' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('return')
  async returnBook(@Req() req, @Body() returnDto: ReturnDto) {
    console.log('📨 Requête retour reçue:', {
      userId: req.user?.id,
      borrowingId: returnDto?.borrowing_id
    });

    if (!returnDto || typeof returnDto.borrowing_id !== 'number') {
      throw new HttpException(
        { message: 'borrowing_id must be a number' },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const result = await this.borrowingsService.returnBook(req.user.id, returnDto.borrowing_id);
      return { data: result, message: 'Book returned successfully' };
    } catch (error) {
      console.error('❌ Erreur retour:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        { message: error.message || 'Failed to return book' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('my-borrowings')
  async getMyBorrowings(@Req() req) {
    try {
      const borrowings = await this.borrowingsService.getUserBorrowings(req.user.id);
      return { data: borrowings };
    } catch (error) {
      console.error('❌ Erreur récupération emprunts:', error);
      throw new HttpException(
        { message: 'Failed to fetch borrowings' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllBorrowings() {
    console.log('📚 Backend - Récupération de TOUS les emprunts (admin)');
    try {
      const borrowings = await this.borrowingsService.getAllBorrowings();
      console.log(`✅ ${borrowings.length} emprunts trouvés`);
      return { data: borrowings };
    } catch (error) {
      console.error('❌ Erreur récupération tous emprunts:', error);
      throw new HttpException(
        { message: 'Failed to fetch borrowings' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}