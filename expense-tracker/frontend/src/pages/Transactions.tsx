import { useEffect, useState } from 'react';
import { api, CATEGORIES, currentMonth, downloadCsv, Tx } from '../api';

const emptyForm = { type: 'expense', amount: '', category: 'Food', description: '', date: new Date().toISOString().slice(0, 10) };

export default function Transactions() {
  const [month, setMonth] = useState(currentMonth());
  const [items, setItems] = useState<Tx[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = () => { api<Tx[]>(`/transactions?month=${month}`).then(setItems); };
  useEffect(load, [month]);

  const save = async () => {
    setError('');
    const body = JSON.stringify({ ...form, amount: Number(form.amount) });
    try {
      if (editing) await api(`/transactions/${editing}`, { method: 'PUT', body });
      else await api('/transactions', { method: 'POST', body });
      setForm(emptyForm); setEditing(null); load();
    } catch (e) { setError((e as Error).message); }
  };
  const edit = (t: Tx) => {
    setEditing(t.id);
    setForm({ type: t.type, amount: String(t.amount), category: t.category, description: t.description ?? '', date: t.date.slice(0, 10) });
  };
  const remove = async (id: number) => { await api(`/transactions/${id}`, { method: 'DELETE' }); load(); };

  return (
    <>
      <div className="filters">
        <h2>Transactions</h2>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
        <button onClick={() => downloadCsv(month)}>Export CSV</button>
      </div>
      <div className="filters">
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
          <option value="expense">Expense</option><option value="income">Income</option>
        </select>
        <input type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        <button onClick={save}>{editing ? 'Update' : 'Add'}</button>
        {editing && <button onClick={() => { setEditing(null); setForm(emptyForm); }}>Cancel</button>}
      </div>
      {error && <p className="error">{error}</p>}
      <table>
        <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th /></tr></thead>
        <tbody>{items.map(t => (
          <tr key={t.id}>
            <td>{t.date.slice(0, 10)}</td><td>{t.category}</td><td>{t.description}</td>
            <td className={t.type === 'income' ? 'pos' : 'neg'}>{t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)}</td>
            <td><button onClick={() => edit(t)}>Edit</button> <button onClick={() => remove(t.id)}>Delete</button></td>
          </tr>
        ))}</tbody>
      </table>
    </>
  );
}
