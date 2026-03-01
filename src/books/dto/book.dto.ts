import { IsString, IsNumber, IsNotEmpty, Min, MaxLength, IsISBN } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  author: string;

  @IsString()
  @IsNotEmpty()
  @IsISBN()
  isbn: string;

  @IsNumber()
  @Min(0)
  stock: number;
}

export class UpdateBookDto {
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsString()
  @MaxLength(255)
  author?: string;

  @IsString()
  @IsISBN()
  isbn?: string;

  @IsNumber()
  @Min(0)
  stock?: number;
}