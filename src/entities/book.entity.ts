import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Borrowing } from './borrowing.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column({ unique: true })
  isbn: string;

  @Column()
  stock: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @OneToMany(() => Borrowing, borrowing => borrowing.book)
  borrowings: Borrowing[];
}