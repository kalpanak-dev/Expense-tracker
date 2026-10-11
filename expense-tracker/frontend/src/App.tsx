import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import RecurringPage from './pages/RecurringPage';

export default function App() {
  const { user, logout } = useAuth();
  return (
    <>
      <nav className="nav">
        <Link to="/" className="brand">Expense Tracker</Link>
        <div className="spacer" />
        {user && (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/transactions">Transactions</Link>
            <Link to="/budgets">Budgets</Link>
            <Link to="/recurring">Recurring</Link>
            <button onClick={logout}>Logout ({user.name})</button>
          </>
        )}
      </nav>
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/transactions" element={user ? <Transactions /> : <Navigate to="/login" />} />
          <Route path="/budgets" element={user ? <Budgets /> : <Navigate to="/login" />} />
          <Route path="/recurring" element={user ? <RecurringPage /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </>
  );
}
