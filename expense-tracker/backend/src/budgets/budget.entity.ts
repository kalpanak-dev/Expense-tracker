import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { numeric } from '../common/numeric.transformer';

@Entity()
@Unique(['userId', 'category'])
export class Budget {
  @PrimaryGeneratedColumn() id: number;
  @Column() userId: number;
  @Column() category: string;
  @Column('decimal', { precision: 12, scale: 2, transformer: numeric }) monthlyLimit: number;
}
