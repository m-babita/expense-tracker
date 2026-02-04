import React, { useState } from 'react';

export default function ExpenseForm({ onAdd, disabled }) {
  const [form, setForm] = useState({ amount: '', category: '', description: '', date: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) {
      return alert('Amount, category, and date are required');
    }
    if (Number(form.amount) <= 0) {
      return alert('Amount must be greater than 0');
    }
    await onAdd({ ...form, amount: form.amount });
    setForm({ amount: '', category: '', description: '', date: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form__row">
        <label>
          Amount (INR)
          <input
            type="number"
            name="amount"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            disabled={disabled}
          />
        </label>
        <label>
          Category
          <input
            type="text"
            name="category"
            placeholder="Food, Travel, Bills"
            value={form.category}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </label>
      </div>
      <div className="form__row">
        <label>
          Description
          <input
            type="text"
            name="description"
            placeholder="Optional note"
            value={form.description}
            onChange={handleChange}
            disabled={disabled}
          />
        </label>
        <label>
          Date
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            disabled={disabled}
          />
        </label>
      </div>
      <button type="submit" className="primary-button" disabled={disabled}>
        {disabled ? 'Saving...' : 'Add Expense'}
      </button>
    </form>
  );
}
