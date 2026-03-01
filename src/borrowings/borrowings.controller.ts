import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Req 
} from '@nestjs/common';
import { BorrowingsService } from './borrowings.service';
import { CreateBorrowingDto, ReturnBorrowingDto } from './dto/borrowing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('borrowings')
@UseGuards(JwtAuthGuard)
export class BorrowingsController {
  constructor(private readonly borrowingsService: BorrowingsService) {}

  @Post('borrow')
  async borrowBook(@Req() req, @Body() createBorrowingDto: CreateBorrowingDto) {
    return this.borrowingsService.borrowBook(req.user.id, createBorrowingDto.book_id);
  }

  @Post('return')
  async returnBook(@Req() req, @Body() returnBorrowingDto: ReturnBorrowingDto) {
    return this.borrowingsService.returnBook(req.user.id, returnBorrowingDto.borrowing_id);
  }

  @Get('my-borrowings')
  async getMyBorrowings(@Req() req) {
    return this.borrowingsService.getUserBorrowings(req.user.id);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllBorrowings() {
    return this.borrowingsService.getAllBorrowings();
  }
}