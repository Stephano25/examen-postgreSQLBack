import { IsString, IsNumber, IsNotEmpty, Min, Max, Length, Matches } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  author: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 13) // ISBN peut être 10 ou 13 caractères
  @Matches(/^[0-9]+$/, { message: 'ISBN must contain only numbers' })
  isbn: string;

  @IsNumber()
  @Min(0)
  @Max(9999)
  stock: number;
}

export class UpdateBookDto {
  @IsString()
  @Length(1, 255)
  title?: string;

  @IsString()
  @Length(1, 255)
  author?: string;

  @IsString()
  @Length(10, 13)
  @Matches(/^[0-9]+$/, { message: 'ISBN must contain only numbers' })
  isbn?: string;

  @IsNumber()
  @Min(0)
  @Max(9999)
  stock?: number;
}