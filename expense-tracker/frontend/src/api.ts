export const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface Tx { id: number; type: 'income' | 'expense'; amount: number; category: string; description?: string; date: string }
export interface Monthly { month: string; income: number; expense: number; balance: number; byCategory: { category: string; total: number }[] }
export interface TrendPoint { month: string; income: number; expense: number }
export interface BudgetRow { id: number; category: string; monthlyLimit: number; spent: number; remaining: number; status: 'ok' | 'warning' | 'exceeded' }
export interface Recurring { id: number; type: 'income' | 'expense'; amount: number; category: string; description?: string; dayOfMonth: number }

export const CATEGORIES = ['Food', 'Transport', 'Housing', 'Utilities', 'Health', 'Entertainment', 'Shopping', 'Salary', 'Other'];

function headers(): HeadersInit {
  const token = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, { ...options, headers: { ...headers(), ...(options.headers ?? {}) } });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = await res.json();
      msg = Array.isArray(body.message) ? body.message.join(', ') : body.message ?? msg;
    } catch { /* ignore */ }
    throw new Error(msg || `Request failed (${res.status})`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export async function downloadCsv(month: string) {
  const res = await fetch(`${BASE}/export/csv?month=${month}`, { headers: headers() });
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `transactions-${month}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const currentMonth = () => new Date().toISOString().slice(0, 7);
