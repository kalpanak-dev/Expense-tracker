import { useEffect, useState } from 'react';
import { api, CATEGORIES, Recurring } from '../api';

const empty = { type: 'expense', amount: '', category: 'Housing', description: '', dayOfMonth: '1' };

export default function RecurringPage() {
  const [rows, setRows] = useState<Recurring[]>([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const load = () => { api<Recurring[]>('/recurring').then(setRows); };
  useEffect(load, []);

  const save = async () => {
    setError('');
    try {
      await api('/recurring', { method: 'POST', body: JSON.stringify({ ...form, amount: Number(form.amount), dayOfMonth: Number(form.dayOfMonth) }) });
      setForm(empty); load();
    } catch (e) { setError((e as Error).message); }
  };
  const remove = async (id: number) => { await api(`/recurring/${id}`, { method: 'DELETE' }); load(); };

  return (
    <>
      <h2>Recurring payments</h2>
      <p>A transaction is created automatically once a month on the chosen day.</p>
      <div className="filters">
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
          <option value="expense">Expense</option><option value="income">Income</option>
        </select>
        <input type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
        <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input type="number" min={1} max={31} value={form.dayOfMonth} onChange={e => setForm({ ...form, dayOfMonth: e.target.value })} title="Day of month" />
        <button onClick={save}>Add</button>
      </div>
      {error && <p className="error">{error}</p>}
      <table>
        <thead><tr><th>Day</th><th>Category</th><th>Description</th><th>Amount</th><th /></tr></thead>
        <tbody>{rows.map(r => (
          <tr key={r.id}><td>{r.dayOfMonth}</td><td>{r.category}</td><td>{r.description}</td>
            <td className={r.type === 'income' ? 'pos' : 'neg'}>{r.amount.toFixed(2)}</td>
            <td><button onClick={() => remove(r.id)}>Delete</button></td></tr>
        ))}</tbody>
      </table>
    </>
  );
}
