export type BudgetStatus = 'ok' | 'warning' | 'exceeded';

/** 'ok' below 80% of the limit, 'warning' from 80%, 'exceeded' above 100%. */
export function budgetStatus(spent: number, limit: number): BudgetStatus {
  if (limit <= 0) return 'ok';
  const ratio = spent / limit;
  if (ratio > 1) return 'exceeded';
  if (ratio >= 0.8) return 'warning';
  return 'ok';
}

/** First and last day (YYYY-MM-DD) of a month given as YYYY-MM. */
export function monthRange(month: string): { from: string; to: string } {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Month must be in the format YYYY-MM');
  const [y, m] = month.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, '0')}` };
}

export function currentMonth(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function csvCell(v: unknown): string {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: { date: string; type: string; category: string; description?: string; amount: number }[]): string {
  const header = 'Date,Type,Category,Description,Amount';
  const lines = rows.map(r => [r.date, r.type, r.category, r.description ?? '', r.amount.toFixed(2)].map(csvCell).join(','));
  return [header, ...lines].join('\n');
}

/**
 * A recurring payment is due when it has not run this month and today's date has reached its day of month.
 * Days beyond the end of a short month (e.g. 31 in June) run on the last day of that month.
 */
export function isRecurringDue(dayOfMonth: number, lastRunMonth: string | null, now: Date): boolean {
  const month = currentMonth(now);
  if (lastRunMonth === month) return false;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return now.getDate() >= Math.min(dayOfMonth, lastDay);
}
