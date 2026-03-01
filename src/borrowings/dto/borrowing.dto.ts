import { IsNumber, IsOptional } from 'class-validator';

export class CreateBorrowingDto {
  @IsNumber()
  book_id: number;
}

export class ReturnBorrowingDto {
  @IsNumber()
  borrowing_id: number;
}