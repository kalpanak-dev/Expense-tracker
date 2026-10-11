import { budgetStatus, isRecurringDue, monthRange, toCsv } from './utils';

describe('budgetStatus', () => {
  it('is ok below 80%', () => expect(budgetStatus(79, 100)).toBe('ok'));
  it('warns from 80%', () => expect(budgetStatus(80, 100)).toBe('warning'));
  it('is still a warning at exactly 100%', () => expect(budgetStatus(100, 100)).toBe('warning'));
  it('is exceeded above 100%', () => expect(budgetStatus(100.01, 100)).toBe('exceeded'));
  it('ignores a zero limit', () => expect(budgetStatus(50, 0)).toBe('ok'));
});

describe('monthRange', () => {
  it('handles 31-day months', () => expect(monthRange('2026-10')).toEqual({ from: '2026-10-01', to: '2026-10-31' }));
  it('handles leap years', () => expect(monthRange('2028-02').to).toBe('2028-02-29'));
  it('rejects bad input', () => expect(() => monthRange('2026-13')).toThrow());
});

describe('toCsv', () => {
  it('writes a header and escapes commas and quotes', () => {
    const csv = toCsv([{ date: '2026-10-01', type: 'expense', category: 'Food', description: 'Lunch, "big"', amount: 12.5 }]);
    expect(csv.split('\n')[0]).toBe('Date,Type,Category,Description,Amount');
    expect(csv.split('\n')[1]).toBe('2026-10-01,expense,Food,"Lunch, ""big""",12.50');
  });
});

describe('isRecurringDue', () => {
  it('is due once the day has been reached', () => expect(isRecurringDue(5, null, new Date(2026, 9, 5))).toBe(true));
  it('is not due before the day', () => expect(isRecurringDue(15, null, new Date(2026, 9, 5))).toBe(false));
  it('is not due twice in the same month', () => expect(isRecurringDue(5, '2026-10', new Date(2026, 9, 20))).toBe(false));
  it('uses the last day of short months', () => expect(isRecurringDue(31, '2026-05', new Date(2026, 5, 30))).toBe(true));
});
