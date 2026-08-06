# Exchange Terminal

Exchange Terminal is a full-stack Bloomberg-style currency exchange terminal with role-based admin operations, manual market/news/event entry, and a dark professional dashboard UI.

## Tech Stack

### Frontend
- React + TypeScript + Vite
- Tailwind CSS
- React Router
- React Query
- Axios
- AG Grid
- TradingView Lightweight Charts

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- bcrypt password hashing

## Project Structure

```
terminal/
  backend/
    prisma/
    src/
  frontend/
    src/
```

## Features

### Authentication
- Register
- Login
- Forgot Password page (UI-only)
- JWT auth with remember-me session duration
- Protected routes
- Logout
- Role-based authorization (`ADMIN`, `USER`)

### Admin Dashboard
CRUD modules for:
- Currencies
- Exchange Rates
- News
- Economic Events
- Sources
- Exchange Offices
- Users (view, role change, disable/enable)

### User Dashboard
- Bloomberg-style dark terminal layout
- Sidebar navigation
- Live exchange rates table (AG Grid)
- Historical chart (line/candlestick)
- Timeframe controls
- News widget
- Economic calendar widget
- Market summary
- Currency strength ranking
- Exchange offices widget

### Search and Filters
- Global search endpoint over currencies/news/offices/events
- API-level filtering and pagination across market data endpoints

## Environment Variables

### Backend (`backend/.env`)
Copy from `backend/.env.example` and set:

```bash
DATABASE_URL="******localhost:5432/exchange_terminal"
PORT=4000
JWT_SECRET="change-me"
JWT_EXPIRES_IN="1d"
JWT_REMEMBER_EXPIRES_IN="30d"
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (`frontend/.env`)
Copy from `frontend/.env.example`:

```bash
VITE_API_URL="http://localhost:4000"
```

## Installation

From repository root:

```bash
cd backend
npm install
cd ../frontend
npm install
```

## Database Setup (Prisma + PostgreSQL)

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Seed creates sample users, currencies, sources, exchange rates, historical rates, news, economic events, and exchange offices.

Default seeded users:
- Admin: `admin@exchange.local` / `Password123!`
- User: `user@exchange.local` / `Password123!`

## Run Locally

In two terminals:

### Terminal 1 — Backend
```bash
cd backend
npm run dev
```

### Terminal 2 — Frontend
```bash
cd frontend
npm run dev
```

Then open `http://localhost:5173`.

## Build Commands

```bash
cd backend && npm run build
cd frontend && npm run build
```

## API Overview

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/profile`
- CRUD: `/currencies`, `/sources`, `/exchange-rates`, `/news`, `/economic-events`, `/exchange-offices`
- `GET /historical-rates`
- `GET /search?q=...`
- Admin users: `GET /users`, `PATCH /users/:id/role`, `PATCH /users/:id/status`

## Extensibility Design

Current ingestion is manual by admins. The architecture keeps data modules separated by domain and exposes clear API boundaries to support future integrations such as:
- External FX APIs
- WhatsApp ingestion
- AI/ML forecasting
- Scheduled jobs
- WebSocket live updates
- Public API and mobile clients
- Notifications and multilingual support
