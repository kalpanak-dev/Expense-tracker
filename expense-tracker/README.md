# Expense Tracker with Analytics

Personal finance app: track income and expenses by category, see monthly spending charts, set budgets with alerts,
create recurring payments and export to CSV.

**Tech:** React 18, TypeScript, Recharts, NestJS 10, TypeORM, PostgreSQL, JWT, Jest, Docker, GitHub Actions.

## Features
- Register / login (JWT, bcrypt-hashed passwords); every user only sees their own data
- Income and expense transactions: add, edit, delete, filter by month
- Dashboard: income, expenses and balance, spending by category (pie chart), last 6 months (bar chart)
- Monthly budgets per category with a progress bar; **alerts** at 80% of the limit and when exceeded
- Recurring payments: a scheduled job (daily at 01:00) creates the month's transaction on the chosen day
- CSV export of any month

## Run locally
Prerequisites: Node 20+, Docker.

```bash
# 1. PostgreSQL
docker compose up -d postgres

# 2. backend (http://localhost:3000)
cd backend
cp .env.example .env     # the defaults match docker-compose
npm install
npm run start:dev

# 3. frontend (http://localhost:5173)
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

## Tests and coverage
```bash
cd backend
npm test            # unit tests for budget alerts, month ranges, CSV export and recurring-payment rules
npm run test:cov    # prints a coverage table
```
The CI workflow runs the tests on every push. Quote only the coverage figure that `test:cov` shows on your CV
(and add more tests for the services to raise it).

## API overview
| Method | Path |
|---|---|
| POST | /auth/register, /auth/login |
| GET, POST | /transactions?month=YYYY-MM |
| PUT, DELETE | /transactions/:id |
| GET | /analytics/monthly?month=, /analytics/trend?months=6 |
| GET, PUT, DELETE | /budgets, /budgets/:id |
| GET, POST, DELETE | /recurring, /recurring/:id |
| GET | /export/csv?month=YYYY-MM |

## Ideas to extend
Service-level tests with a test database, TypeORM migrations instead of `synchronize`, multiple currencies,
receipt uploads, dark mode.
