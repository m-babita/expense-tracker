import React from 'react';

export default function FilterSortControls({
  categoryValue,
  onCategoryChange,
  sortValue,
  onSortChange
}) {
  return (
    <div className="controls">
      <label>
        Filter by category
        <input
          type="text"
          placeholder="Type a category"
          value={categoryValue}
          onChange={e => onCategoryChange(e.target.value)}
        />
      </label>

      <label>
        Sort by date
        <select value={sortValue} onChange={e => onSortChange(e.target.value)}>
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
        </select>
      </label>

      {categoryValue && (
        <button type="button" className="link-button" onClick={() => onCategoryChange('')}>
          Clear filter
        </button>
      )}
    </div>
  );
}
