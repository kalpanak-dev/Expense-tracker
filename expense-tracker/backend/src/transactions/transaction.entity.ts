import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { numeric } from '../common/numeric.transformer';

@Entity()
@Index(['userId', 'date'])
export class Transaction {
  @PrimaryGeneratedColumn() id: number;
  @Column() userId: number;
  @Column({ type: 'varchar', length: 10 }) type: 'income' | 'expense';
  @Column('decimal', { precision: 12, scale: 2, transformer: numeric }) amount: number;
  @Column() category: string;
  @Column({ nullable: true }) description?: string;
  @Column({ type: 'date' }) date: string; // YYYY-MM-DD
  @Column({ type: 'int', nullable: true }) recurringId: number | null;
}
