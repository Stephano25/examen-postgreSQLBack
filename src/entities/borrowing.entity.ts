import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Book } from './book.entity';

@Entity('borrowings')
export class Borrowing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'book_id' })
  book_id: number;

  @CreateDateColumn({ name: 'borrowed_at' })
  borrowed_at: Date;

  @Column({ name: 'returned_at', nullable: true })
  returned_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Book)
  @JoinColumn({ name: 'book_id' })
  book: Book;
}