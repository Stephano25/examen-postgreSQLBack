import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Borrowing } from './borrowing.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true, type: 'varchar' })
  email: string | null;  // ✅ Accepter null

  @Column({ name: 'password_hash' })
  password_hash: string;

  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @OneToMany(() => Borrowing, borrowing => borrowing.user)
  borrowings: Borrowing[];
}