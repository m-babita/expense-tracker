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
- Optional header: `Idempotency-Key` (recommended)

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

## Design Decisions
- **Money handling**: Amounts are stored as integer paise to avoid floating-point errors.
- **Idempotency**: The API supports `Idempotency-Key` headers. The UI generates a request ID and stores the pending payload in `localStorage` to retry after refreshes or transient failures.
- **Storage**: lowdb JSON file keeps setup minimal while still persisting data between restarts.

## Trade-offs
- Chose lowdb over a relational DB to stay lightweight and quick to run locally.
- Category filtering uses exact matches to keep behavior predictable and simple.

## Not Implemented (Intentionally)
- Automated tests (would be next for backend validation + idempotency)
- Auth or multi-user support
- A per-category summary view (easy follow-on)
