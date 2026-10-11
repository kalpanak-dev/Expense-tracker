import { useEffect, useState } from 'react';
import { api, BudgetRow, CATEGORIES } from '../api';

export default function Budgets() {
  const [rows, setRows] = useState<BudgetRow[]>([]);
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [error, setError] = useState('');
  const load = () => { api<BudgetRow[]>('/budgets').then(setRows); };
  useEffect(load, []);

  const save = async () => {
    setError('');
    try {
      await api('/budgets', { method: 'PUT', body: JSON.stringify({ category, monthlyLimit: Number(limit) }) });
      setLimit(''); load();
    } catch (e) { setError((e as Error).message); }
  };
  const remove = async (id: number) => { await api(`/budgets/${id}`, { method: 'DELETE' }); load(); };

  return (
    <>
      <h2>Monthly budgets</h2>
      <div className="filters">
        <select value={category} onChange={e => setCategory(e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
        <input type="number" step="0.01" placeholder="Monthly limit" value={limit} onChange={e => setLimit(e.target.value)} />
        <button onClick={save}>Save budget</button>
      </div>
      {error && <p className="error">{error}</p>}
      {rows.map(r => (
        <div className="card wide" key={r.id}>
          <b>{r.category}</b> <span className={`badge ${r.status}`}>{r.status}</span>
          <div className="bar"><div className={`fill ${r.status}`} style={{ width: `${Math.min(100, (r.spent / r.monthlyLimit) * 100)}%` }} /></div>
          <small>{r.spent.toFixed(2)} spent of {r.monthlyLimit.toFixed(2)} this month</small>{' '}
          <button onClick={() => remove(r.id)}>Remove</button>
        </div>
      ))}
    </>
  );
}
