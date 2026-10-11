import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { monthRange, toCsv } from '../common/utils';
import { TransactionDto } from './dto';
import { Transaction } from './transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(@InjectRepository(Transaction) private repo: Repository<Transaction>) {}

  list(userId: number, month?: string, category?: string) {
    const where: FindOptionsWhere<Transaction> = { userId };
    if (month) where.date = Between(...this.range(month));
    if (category) where.category = category;
    return this.repo.find({ where, order: { date: 'DESC', id: 'DESC' } });
  }

  create(userId: number, dto: TransactionDto) {
    return this.repo.save(this.repo.create({ ...dto, date: dto.date.slice(0, 10), userId, recurringId: null }));
  }

  async update(userId: number, id: number, dto: TransactionDto) {
    const tx = await this.find(userId, id);
    return this.repo.save({ ...tx, ...dto, date: dto.date.slice(0, 10) });
  }

  async remove(userId: number, id: number) {
    await this.repo.remove(await this.find(userId, id));
  }

  async exportCsv(userId: number, month?: string) {
    return toCsv(await this.list(userId, month));
  }

  /** Income, expenses and expenses per category for one month. */
  async monthly(userId: number, month: string) {
    const [from, to] = this.range(month);
    const rows = await this.repo.createQueryBuilder('t')
      .select('t.type', 'type').addSelect('t.category', 'category').addSelect('SUM(t.amount)', 'total')
      .where('t.userId = :userId AND t.date BETWEEN :from AND :to', { userId, from, to })
      .groupBy('t.type').addGroupBy('t.category').getRawMany();
    let income = 0, expense = 0;
    const byCategory: { category: string; total: number }[] = [];
    for (const r of rows) {
      const total = Number(r.total);
      if (r.type === 'income') income += total;
      else { expense += total; byCategory.push({ category: r.category, total }); }
    }
    byCategory.sort((a, b) => b.total - a.total);
    return { month, income, expense, balance: income - expense, byCategory };
  }

  /** Income and expense totals for each of the last N months (oldest first). */
  async trend(userId: number, months: number) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    const from = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`;
    const rows = await this.repo.createQueryBuilder('t')
      .select("to_char(t.date, 'YYYY-MM')", 'month').addSelect('t.type', 'type').addSelect('SUM(t.amount)', 'total')
      .where('t.userId = :userId AND t.date >= :from', { userId, from })
      .groupBy('month').addGroupBy('t.type').getRawMany();
    const result: { month: string; income: number; expense: number }[] = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const get = (type: string) => Number(rows.find(r => r.month === month && r.type === type)?.total ?? 0);
      result.push({ month, income: get('income'), expense: get('expense') });
    }
    return result;
  }

  private async find(userId: number, id: number) {
    const tx = await this.repo.findOne({ where: { id, userId } });
    if (!tx) throw new NotFoundException();
    return tx;
  }

  private range(month: string): [string, string] {
    try {
      const r = monthRange(month);
      return [r.from, r.to];
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
  }
}
