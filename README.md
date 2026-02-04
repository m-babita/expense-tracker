# Expense Tracker

Minimal full-stack expense tracker with a Node.js API and a React UI.

**Features**
- Create a new expense with amount, category, description, and date.
- List expenses with optional category filter and date sorting.
- View total for the currently visible list.
- Resilient to retries and refreshes using idempotency keys + localStorage.

**Tech Stack**
- Backend: Node.js + Express + lowdb (JSON file storage)
- Frontend: React + Axios

## Data Model
Each expense record includes:
- `id`
- `amount` (stored as integer paise)
- `category`
- `description`
- `date` (normalized `YYYY-MM-DD`)
- `created_at`

## API
`POST /expenses`
- Body: `amount`, `category`, `description`, `date`

`GET /expenses`
- Query: `category` (case-insensitive exact match)
- Query: `sort=date_desc` (newest first)
- Query: `sort=date_asc` (oldest first)

## Running Locally

**Backend**
```bash
cd expense-tracker/backend
npm install
node index.js
```

**Frontend**
```bash
cd expense-tracker/frontend
npm install
npm start
```

The frontend expects the API at `http://localhost:4000`.
