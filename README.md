# Expense Tracker (Production-Quality Minimal)

A minimal full‑stack Expense Tracker with strong correctness, validation, and idempotent writes.

## Architecture Summary
- **Backend**: Node.js + TypeScript + Express + Prisma + Zod  
- **Frontend**: React + TypeScript + Vite  
- **Local DB**: SQLite  
- **Production DB**: PostgreSQL (Vercel-friendly)

## Data Model
```
Expense
- id (string)
- amountCents (int)
- category (string)
- description (string)
- date (datetime)
- createdAt (datetime)
- idempotencyKey (unique)
```

## Idempotency Strategy
Each `POST /expenses` requires `Idempotency-Key` header (UUID).  
The DB has a unique constraint on `idempotencyKey`, so retries or double-clicks return the same record instead of duplicating.

## Validation
Zod validates all required fields. Money is stored as integer paise (cents).

## API Endpoints
- `POST /expenses`
- `GET /expenses?category=&sort=date_desc`
- `GET /health`

## Local Setup

### 1) Install dependencies
```
npm install
```

### 2) Backend env
```
cd backend
cp .env.example .env
```

### 3) Prisma generate + migrate
```
npx prisma generate
npx prisma migrate dev --name init
```

### 4) Run locally (both frontend + backend)
```
npm run dev
```

- Backend: http://localhost:4000  
- Frontend: http://localhost:5173

## Tests
```
npm run test
```

## Production / Vercel Deployment

### Required Environment Variables (Vercel)
```
DATABASE_URL=postgresql://...
DATABASE_PROVIDER=postgresql
```

### Notes on Persistence
- SQLite is used locally.
- In production (Vercel), **use PostgreSQL** (Neon or Supabase).  
  Prisma will connect via `DATABASE_URL`.

### Vercel Steps
1. Create a Postgres database (Neon/Supabase).
2. Set env vars in Vercel:
   - `DATABASE_URL`
   - `DATABASE_PROVIDER=postgresql`
3. Deploy using Git integration (Vercel auto-detects).
4. Run Prisma migrate in CI/CD or manually:
   ```
   npx prisma migrate deploy
   ```

### Routing
- `/api/*` -> serverless Express handler (`api/index.ts`)
- `/` -> static Vite build (`frontend/dist`)

## Trade-offs / Omissions
- No authentication (single-user local tool).
- Minimal UI styling to focus on correctness.

## Key Design Decisions
- Strong idempotency to protect against retries/double submit.
- Integer cents for money correctness.
- URL query params for filters.
- Server-side validation + strict typing.
