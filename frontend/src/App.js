import React, { useEffect, useRef, useState } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import FilterSortControls from './components/FilterSortControls';
import axios from 'axios';
import './App.css';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
const PENDING_STORAGE_KEY = 'expenseTracker:pendingExpense';
const INR_SYMBOL = '\u20B9';

function formatPaise(amountPaise) {
  const amount = Number(amountPaise || 0);
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  const rupees = Math.trunc(abs / 100);
  const paise = String(abs % 100).padStart(2, '0');
  const formattedRupees = Number(rupees).toLocaleString('en-IN');
  return `${sign}${INR_SYMBOL}${formattedRupees}.${paise}`;
}

function App() {
  const [expenses, setExpenses] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('date_desc');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(null);
  const retriedPendingRef = useRef(false);

  const fetchExpenses = async (nextCategory = categoryFilter, nextSort = sortOrder) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/expenses`, {
        params: {
          category: nextCategory || undefined,
          sort: nextSort || undefined
        }
      });
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
      setError('Unable to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearPending = () => {
    localStorage.removeItem(PENDING_STORAGE_KEY);
    setPending(null);
    retriedPendingRef.current = false;
  };

  const submitExpense = async ({ requestId, payload }) => {
    setSubmitLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/expenses`, payload, {
        headers: {
          'Idempotency-Key': requestId
        }
      });
      clearPending();
      await fetchExpenses();
    } catch (err) {
      console.error(err);
      setError('Unable to save the expense. We will keep it ready to retry.');
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter, sortOrder]);

  useEffect(() => {
    const stored = localStorage.getItem(PENDING_STORAGE_KEY);
    if (stored) {
      try {
        setPending(JSON.parse(stored));
      } catch (err) {
        console.error(err);
        localStorage.removeItem(PENDING_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (!pending || retriedPendingRef.current) return;
    retriedPendingRef.current = true;
    submitExpense(pending);
  }, [pending]);

  const handleAddExpense = async (expense) => {
    const requestId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const payload = { ...expense };
    const nextPending = { requestId, payload };
    localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(nextPending));
    setPending(nextPending);
    await submitExpense(nextPending);
  };

  const handleRetryPending = () => {
    if (!pending) return;
    submitExpense(pending);
  };

  const totalPaise = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="app__eyebrow">Personal Finance</p>
          <h1>Expense Tracker</h1>
          <p className="app__subtitle">Capture expenses, filter by category, and keep a running total.</p>
        </div>
      </header>

      <section className="app__panel">
        <ExpenseForm onAdd={handleAddExpense} disabled={submitLoading} />

        <FilterSortControls
          categoryValue={categoryFilter}
          onCategoryChange={setCategoryFilter}
          sortValue={sortOrder}
          onSortChange={setSortOrder}
        />

        {error && (
          <div className="status status--error">
            <span>{error}</span>
            {pending && (
              <button type="button" className="link-button" onClick={handleRetryPending}>
                Retry pending save
              </button>
            )}
          </div>
        )}

        {pending && !error && (
          <div className="status status--info">
            We are retrying a saved expense submission.
          </div>
        )}

        {loading ? (
          <p className="status status--info">Loading expenses...</p>
        ) : (
          <ExpenseList expenses={expenses} formatAmount={formatPaise} />
        )}

        <div className="total">
          <span>Total</span>
          <strong>{formatPaise(totalPaise)}</strong>
        </div>
      </section>
    </div>
  );
}

export default App;
