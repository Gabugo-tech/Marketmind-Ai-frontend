# MarketMind AI

> **Know Your Stock. Predict Your Sales. Grow Your Business.**

**Smart Market Inventory Management and AI-Powered Sales Forecasting for Traders in Onitsha, Anambra State, Nigeria.**

Built for the **HACK4HOD: BUILD FOR ANAMBRA** competition organized by GDG COOU.

---

## The Problem

Traders in Onitsha — one of West Africa's largest commercial hubs — manage billion-naira inventories using notebooks, calculators, and intuition. This results in:

- Unexpected stockouts of profitable products
- Excess capital tied up in slow-moving items
- No visibility into which products generate the most profit
- Business decisions made on gut feeling rather than data
- Avoidable losses from poor restocking timing

## The Solution

MarketMind AI transforms ordinary sales records into actionable business intelligence. It combines:

- **Real inventory management** with full audit trails
- **AI-powered demand forecasting** (Holt's Exponential Smoothing)
- **Intelligent restocking recommendations** with urgency scoring
- **Gemini-powered AI assistant** that answers questions about your actual business data
- **Professional analytics dashboard** with real-time charts

---

## Core Features

| Module | Description |
|--------|-------------|
| 🔐 Authentication | Secure JWT auth with refresh tokens |
| 📦 Inventory | Products, categories, suppliers, stock movements |
| 🛒 Sales | POS-style sale recording with stock auto-deduction |
| 🚛 Purchases | Restock recording with supplier tracking |
| 📊 Analytics | Real-time dashboard, revenue trends, top products |
| 🤖 AI Forecasting | 7/14/30-day demand predictions with MAPE accuracy |
| 💡 Restock Engine | Urgency-scored recommendations with lead time math |
| 💬 AI Assistant | Gemini-powered natural language business queries |
| 🔔 Notifications | Stock alerts, stockout predictions, slow movers |

---

## Technology Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Recharts, React Query, Zustand

**Backend:** Node.js, Express, TypeScript, Prisma ORM

**Database:** PostgreSQL via Supabase (with connection pooling via PgBouncer)

**AI:** Google Gemini 1.5 Flash (assistant), Holt's Double Exponential Smoothing + Moving Average (forecasting)

**Deployment:** Vercel (frontend) · Railway (backend) · Supabase (database)

---

## Quick Start

### Prerequisites
- Node.js 20+
- A Supabase project
- A Railway account
- Google Gemini API key (from [aistudio.google.com](https://aistudio.google.com))

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd marketmind-ai

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies  
cd ../frontend && npm install
```

### 2. Configure Backend Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
# Supabase — from Project Settings → Database
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-west-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"

JWT_SECRET="your-32-char-minimum-secret"
JWT_REFRESH_SECRET="your-32-char-refresh-secret"

GEMINI_API_KEY="your-gemini-api-key"
FRONTEND_URL="http://localhost:5173"
PORT=5000
NODE_ENV=development
```

### 3. Configure Frontend Environment

```bash
cp frontend/.env.example frontend/.env.local
```

```env
VITE_API_URL="http://localhost:5000"
```

### 4. Database Setup

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Run migrations (creates all tables)
npm run db:migrate

# Seed demo data (Anambra Electronics Hub with 90 days of history)
npm run db:seed
```

### 5. Run Development Servers

**Terminal 1 — Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 6. Demo Login

```
Email:    demo@marketmind.ai
Password: Demo1234!
```

This account has 90 days of realistic sales history for **Anambra Electronics Hub**, Onitsha — ready for live demonstration.

---

## Deployment

### Supabase Database

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Database**
3. Copy the **Session mode** pooler URL → set as `DATABASE_URL`
4. Copy the **Direct connection** URL → set as `DIRECT_URL`

### Railway (Backend)

1. Create a new project at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Add all environment variables from `.env.example`
5. Railway auto-detects Node.js and runs `npm run build && npm start`
6. The `railway.json` runs `prisma migrate deploy` automatically on each deploy

### Vercel (Frontend)

1. Import your repository at [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variable:
   - `VITE_API_URL` = your Railway backend URL (e.g. `https://marketmind-backend.up.railway.app`)
4. Deploy — Vercel handles the build automatically
5. `vercel.json` configures SPA routing

---

## AI Architecture

### Sales Forecasting

The forecasting engine (`backend/src/services/forecasting.service.ts`) implements two algorithms:

1. **Holt's Double Exponential Smoothing** — for products with 21+ days of data. Captures both level and trend components.
   - Level smoothing: α = 0.3
   - Trend smoothing: β = 0.1

2. **Simple Moving Average** — for products with 7-20 days of data. 7-day rolling window.

**Accuracy evaluation:** The last 7 days of historical data are held out as a test set. MAPE (Mean Absolute Percentage Error) and MAE are calculated against actual sales, giving honest accuracy reporting.

**Confidence intervals:** Forecast bands at ±(MAPE/100) of predicted value.

**Insufficient data:** Products with fewer than 7 days of sales are flagged with an explanation rather than generating unreliable predictions.

### Restocking Engine

`backend/src/services/restocking.service.ts` calculates:
- **Average daily velocity:** Weighted blend of 14-day (70%) and 30-day (30%) sales
- **Reorder point:** `(avg_daily × lead_time_days) + safety_stock`
- **Safety stock:** 1.5× daily demand
- **Urgency:** IMMEDIATE if stock < lead_time demand, SOON if stock < reorder point, SUFFICIENT otherwise

### Gemini AI Assistant

`backend/src/services/assistant.service.ts` follows a secure context-injection pattern:
1. User question arrives at backend (never touches the frontend's API key)
2. Backend queries the database for relevant business data (today's sales, top products, stock levels, etc.)
3. Business context is injected into Gemini's system prompt
4. Gemini generates a response grounded in real data
5. Response is stored in conversation history for multi-turn dialogue

---

## Project Structure

```
marketmind-ai/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Full database schema
│   └── src/
│       ├── config/                # Environment config
│       ├── controllers/           # Route handlers
│       ├── database/
│       │   ├── client.ts          # Prisma client
│       │   └── seed.ts            # Demo data seeder
│       ├── middleware/            # Auth, error handling, validation
│       ├── routes/                # Express routers
│       ├── services/              # Business logic
│       │   ├── analytics.service.ts
│       │   ├── assistant.service.ts    # Gemini integration
│       │   ├── auth.service.ts
│       │   ├── forecasting.service.ts  # ML forecasting
│       │   ├── inventory.service.ts
│       │   ├── purchases.service.ts
│       │   ├── restocking.service.ts   # Restock engine
│       │   └── sales.service.ts
│       ├── types/                 # TypeScript types
│       └── server.ts              # Express app entry
└── frontend/
    └── src/
        ├── components/
        │   ├── layout/            # Sidebar, AppLayout
        │   └── ui/                # Design system components
        ├── lib/                   # API client, utilities
        ├── pages/                 # All page components
        ├── store/                 # Zustand auth store
        └── types/                 # Shared TypeScript types
```

---

## Demo Business

The seed data creates **Anambra Electronics Hub** with:
- 20 realistic products (smartphones, earphones, accessories, power banks)
- 3 suppliers (Lagos Tech Wholesale, Aba Electronics, Alaba International)
- ~270 sales transactions across 90 days with realistic demand patterns
- Stock notifications (out-of-stock, critical, low)

> ⚠️ Demo data is for hackathon demonstration only. Not real trader transactions.

---

## Submission Details

**Competition:** HACK4HOD: BUILD FOR ANAMBRA by GDG COOU

**Category:** Business Technology / FinTech

**AI Tools Used:**
- Google Gemini 1.5 Flash — AI business assistant (integrated into the product)
- Holt's Exponential Smoothing — Time-series demand forecasting (custom implementation)
- Kiro AI — Development assistance

---

## Screenshots

*[Add screenshots of dashboard, forecasting, and AI assistant after deployment]*

---

## Team

*[Team details to be added]*

---

*Built with ❤️ for Onitsha traders.*
