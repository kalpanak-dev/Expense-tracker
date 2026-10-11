import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { budgetStatus, currentMonth, monthRange } from '../common/utils';
import { Transaction } from '../transactions/transaction.entity';
import { BudgetDto } from './dto';
import { Budget } from './budget.entity';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget) private budgets: Repository<Budget>,
    @InjectRepository(Transaction) private transactions: Repository<Transaction>,
  ) {}

  /** Each budget with how much has been spent this month. Status 'warning' / 'exceeded' drives the alerts in the UI. */
  async listWithSpending(userId: number, month = currentMonth()) {
    const range = this.range(month);
    const spentRows = await this.transactions.createQueryBuilder('t')
      .select('t.category', 'category').addSelect('SUM(t.amount)', 'total')
      .where("t.userId = :userId AND t.type = 'expense' AND t.date BETWEEN :from AND :to", { userId, ...range })
      .groupBy('t.category').getRawMany();
    const spentBy = new Map<string, number>(spentRows.map(r => [r.category as string, Number(r.total)]));
    const budgets = await this.budgets.find({ where: { userId }, order: { category: 'ASC' } });
    return budgets.map(b => {
      const spent = spentBy.get(b.category) ?? 0;
      return { ...b, spent, remaining: b.monthlyLimit - spent, status: budgetStatus(spent, b.monthlyLimit) };
    });
  }

  private range(month: string) {
    try { return monthRange(month); } catch (e) { throw new BadRequestException((e as Error).message); }
  }

  async upsert(userId: number, dto: BudgetDto) {
    const existing = await this.budgets.findOne({ where: { userId, category: dto.category } });
    return this.budgets.save({ ...(existing ?? {}), userId, category: dto.category, monthlyLimit: dto.monthlyLimit });
  }

  async remove(userId: number, id: number) {
    const b = await this.budgets.findOne({ where: { id, userId } });
    if (!b) throw new NotFoundException();
    await this.budgets.remove(b);
  }
}
