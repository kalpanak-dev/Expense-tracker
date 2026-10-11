import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api, BudgetRow, currentMonth, Monthly, TrendPoint } from '../api';

const COLORS = ['#0f766e', '#2563eb', '#d97706', '#9333ea', '#dc2626', '#0891b2', '#65a30d', '#be185d', '#6b7280'];

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonth());
  const [summary, setSummary] = useState<Monthly | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [budgets, setBudgets] = useState<BudgetRow[]>([]);

  useEffect(() => {
    api<Monthly>(`/analytics/monthly?month=${month}`).then(setSummary);
    api<BudgetRow[]>(`/budgets?month=${month}`).then(setBudgets);
  }, [month]);
  useEffect(() => { api<TrendPoint[]>('/analytics/trend?months=6').then(setTrend); }, []);

  const alerts = budgets.filter(b => b.status !== 'ok');
  return (
    <>
      <div className="filters"><h2>Dashboard</h2><input type="month" value={month} onChange={e => setMonth(e.target.value)} /></div>
      {alerts.map(b => (
        <div key={b.id} className={`alert ${b.status}`}>
          {b.status === 'exceeded' ? 'Over budget' : 'Close to the limit'}: {b.category} ({b.spent.toFixed(2)} of {b.monthlyLimit.toFixed(2)})
        </div>
      ))}
      {summary && (
        <div className="stats">
          <div className="card"><small>Income</small><h3 className="pos">{summary.income.toFixed(2)}</h3></div>
          <div className="card"><small>Expenses</small><h3 className="neg">{summary.expense.toFixed(2)}</h3></div>
          <div className="card"><small>Balance</small><h3>{summary.balance.toFixed(2)}</h3></div>
        </div>
      )}
      <div className="charts">
        <div className="card">
          <h4>Spending by category</h4>
          {summary && summary.byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={summary.byCategory} dataKey="total" nameKey="category" outerRadius={90} label>
                  {summary.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p>No expenses this month.</p>}
        </div>
        <div className="card">
          <h4>Last 6 months</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="income" fill="#0f766e" /><Bar dataKey="expense" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
