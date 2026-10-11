import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { numeric } from '../common/numeric.transformer';

@Entity()
export class RecurringPayment {
  @PrimaryGeneratedColumn() id: number;
  @Column() userId: number;
  @Column({ type: 'varchar', length: 10 }) type: 'income' | 'expense';
  @Column('decimal', { precision: 12, scale: 2, transformer: numeric }) amount: number;
  @Column() category: string;
  @Column({ nullable: true }) description?: string;
  @Column({ type: 'int' }) dayOfMonth: number;
  @Column({ type: 'varchar', nullable: true }) lastRunMonth: string | null; // YYYY-MM
  @Column({ default: true }) active: boolean;
}
