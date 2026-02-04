import React from 'react';

export default function ExpenseList({ expenses, formatAmount }) {
  if (!expenses.length) return <p className="status status--info">No expenses found.</p>;

  return (
    <table className="expense-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Description</th>
          <th className="expense-table__amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map(e => (
          <tr key={e.id}>
            <td>{e.date}</td>
            <td>{e.category}</td>
            <td>{e.description || '-'}</td>
            <td className="expense-table__amount">{formatAmount(e.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
