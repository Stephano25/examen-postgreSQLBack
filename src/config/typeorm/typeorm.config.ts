import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Book } from '../../entities/book.entity';
import { Borrowing } from '../../entities/borrowing.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'libraflow',
  entities: [User, Book, Borrowing],
  synchronize: false, // Set to false in production
  logging: true,
};