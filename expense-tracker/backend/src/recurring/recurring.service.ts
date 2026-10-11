import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { currentMonth, isRecurringDue } from '../common/utils';
import { Transaction } from '../transactions/transaction.entity';
import { RecurringDto } from './dto';
import { RecurringPayment } from './recurring.entity';

@Injectable()
export class RecurringService {
  private readonly log = new Logger(RecurringService.name);

  constructor(
    @InjectRepository(RecurringPayment) private repo: Repository<RecurringPayment>,
    @InjectRepository(Transaction) private transactions: Repository<Transaction>,
  ) {}

  list(userId: number) { return this.repo.find({ where: { userId }, order: { dayOfMonth: 'ASC' } }); }

  async create(userId: number, dto: RecurringDto) {
    const saved = await this.repo.save(this.repo.create({ ...dto, userId, lastRunMonth: null }));
    await this.runDue(new Date()); // create this month's entry right away if the day has already passed
    return saved;
  }

  async remove(userId: number, id: number) {
    const r = await this.repo.findOne({ where: { id, userId } });
    if (!r) throw new NotFoundException();
    await this.repo.remove(r);
  }

  /** Runs every day at 01:00 and creates the month's transaction for each payment that is due. */
  @Cron('0 1 * * *')
  async runDue(now = new Date()) {
    const month = currentMonth(now);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (const r of await this.repo.find({ where: { active: true } })) {
      if (!isRecurringDue(r.dayOfMonth, r.lastRunMonth, now)) continue;
      const day = Math.min(r.dayOfMonth, lastDay);
      await this.transactions.save(this.transactions.create({
        userId: r.userId, type: r.type, amount: r.amount, category: r.category, description: r.description,
        date: `${month}-${String(day).padStart(2, '0')}`, recurringId: r.id,
      }));
      r.lastRunMonth = month;
      await this.repo.save(r);
      this.log.log(`Created recurring transaction ${r.id} for ${month}`);
    }
  }
}
