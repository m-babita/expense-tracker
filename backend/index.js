import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Low, JSONFile } from 'lowdb';
import { nanoid } from 'nanoid';

const app = express();
const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 4000);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const HOST = '0.0.0.0';

app.use(
  cors({
    origin: FRONTEND_URL
  })
);
app.use(bodyParser.json({ limit: '10kb' }));

// Setup DB
const adapter = new JSONFile('db.json');
const db = new Low(adapter);

await db.read();
db.data ||= { expenses: [], idempotency: {} };

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function parseAmountToPaise(amount) {
  if (isBlank(amount)) return { ok: false, error: 'Amount is required' };
  const raw = String(amount).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    return { ok: false, error: 'Amount must be a positive number with up to 2 decimals' };
  }

  const [rupeesPart, paisePartRaw] = raw.split('.');
  const paisePart = (paisePartRaw || '').padEnd(2, '0');
  const paise = BigInt(rupeesPart) * 100n + BigInt(paisePart);
  if (paise > BigInt(MAX_SAFE_INTEGER)) {
    return { ok: false, error: 'Amount is too large' };
  }

  return { ok: true, value: Number(paise) };
}

function normalizeDate(dateInput) {
  if (isBlank(dateInput)) return { ok: false, error: 'Date is required' };
  const raw = String(dateInput).trim();
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return { ok: false, error: 'Date must be a valid ISO date or YYYY-MM-DD' };
  }
  const isoDate = parsed.toISOString().slice(0, 10);
  return { ok: true, value: isoDate };
}

function normalizeCategory(category) {
  if (isBlank(category)) return { ok: false, error: 'Category is required' };
  return { ok: true, value: String(category).trim() };
}

function getIdempotencyKey(req) {
  const headerKey = req.header('Idempotency-Key');
  if (!isBlank(headerKey)) return String(headerKey).trim();
  const bodyKey = req.body?.idempotency_key;
  if (!isBlank(bodyKey)) return String(bodyKey).trim();
  return '';
}

// POST /expenses
app.post('/expenses', async (req, res) => {
  const { amount, category, description, date } = req.body;
  const amountResult = parseAmountToPaise(amount);
  if (!amountResult.ok) return res.status(400).json({ error: amountResult.error });

  const categoryResult = normalizeCategory(category);
  if (!categoryResult.ok) return res.status(400).json({ error: categoryResult.error });

  const dateResult = normalizeDate(date);
  if (!dateResult.ok) return res.status(400).json({ error: dateResult.error });

  const idempotencyKey = getIdempotencyKey(req);

  await db.read();
  db.data ||= { expenses: [], idempotency: {} };

  if (idempotencyKey && db.data.idempotency[idempotencyKey]) {
    const existingId = db.data.idempotency[idempotencyKey];
    const existingExpense = db.data.expenses.find(e => e.id === existingId);
    if (existingExpense) {
      return res.status(200).json(existingExpense);
    }
  }

  const expense = {
    id: nanoid(),
    amount: amountResult.value,
    category: categoryResult.value,
    description: isBlank(description) ? '' : String(description).trim(),
    date: dateResult.value,
    created_at: new Date().toISOString()
  };

  db.data.expenses.push(expense);
  if (idempotencyKey) {
    db.data.idempotency[idempotencyKey] = expense.id;
  }

  await db.write();
  res.status(201).json(expense);
});

// GET /expenses
app.get('/expenses', async (req, res) => {
  const { category, sort } = req.query;
  await db.read();
  let expenses = [...db.data.expenses];

  if (category) {
    const normalized = String(category).trim().toLowerCase();
    expenses = expenses.filter(e => e.category.toLowerCase() === normalized);
  }

  if (sort === 'date_desc') {
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  if (sort === 'date_asc') {
    expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  res.json(expenses);
});

app.listen(PORT, HOST, () => console.log(`Backend running on http://${HOST}:${PORT}`));
