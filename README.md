# Crypto Trading Game

This repository is a solo-built crypto trading simulator prototype. The app lets a user watch live crypto prices, open virtual long or short positions, track unrealized P&L in real time, and close positions against a virtual wallet balance.

## What The App Does

- Shows live prices for `BTC`, `ETH`, and `SOL`
- Seeds a virtual wallet with `$10,000`
- Lets the user open long and short positions
- Stores positions and wallet state in the backend database
- Calculates live unrealized P&L on the frontend
- Lets the user close open positions and realizes P&L into wallet balance
- Displays a live price dashboard and a separate trade workflow page

There is also some Week 6 groundwork already present in the codebase:

- Leverage selection (`1x`, `5x`, `10x`, `25x`)
- Stop-loss and take-profit fields stored on positions

The automated charting, SL/TP auto-close flow, trade history, reset flow, and deployment work are still upcoming.

## Current Implementation Status

### Completed Through Week 4

#### Week 1: Environment and app setup

- Next.js frontend scaffolded under `frontend/`
- FastAPI backend scaffolded under `backend/`
- Frontend and backend run as separate local apps

#### Week 2: Live prices

- Backend fetches live prices on a background loop
- `/prices` endpoint exposes current market data
- Frontend homepage polls prices and renders live market cards

#### Week 3: Virtual wallet and trade form

- Wallet model and position model are defined
- Backend seeds a wallet with `$10,000`
- `POST /trades/open` opens a position
- `GET /wallet` returns current balance
- Trade page includes asset, side, amount, leverage, stop-loss, and take-profit inputs

#### Week 4: Live P&L and close flow

- Open positions render as cards
- Unrealized P&L updates from live prices on the frontend
- `POST /trades/close` closes positions using the latest backend price
- Closed trade P&L is credited back into the wallet balance

## Upcoming Build

These are the remaining weekly milestones from the build plan.

### Week 5: Add the chart

- Install `lightweight-charts`
- Fetch historical OHLCV candle data from Binance REST API
- Render a BTC candlestick chart on the `1H` timeframe
- Add a `1H` / `1D` timeframe switcher
- Mark open-position entry price on the chart

### Week 6: Leverage + stop-loss + take-profit

- Add background SL/TP checks and auto-close logic
- Add a balance guard for leveraged position sizing
- Finish the leverage and risk-management flow end to end

Note: parts of this week are already partially present in the current codebase via leverage selection and stored SL/TP fields.

### Week 7: Trade history + balance reset

- Build a closed-trades endpoint for history
- Add a Trade History section in the UI
- Add wallet reset support and a confirmation flow
- Show performance summary metrics such as win rate and biggest win/loss
- Polish the UI

### Week 8: Deploy and share

- Deploy the Next.js frontend to Vercel
- Deploy the FastAPI backend to Railway or Render
- Move API URLs to environment variables
- Test the full app on a live hosted URL

## Tech Stack

- Frontend: Next.js, React
- Backend: FastAPI, SQLAlchemy
- Data fetching: `httpx`
- Database: SQLAlchemy async engine via `DATABASE_URL`

## Project Structure

- `frontend/`: Next.js app, pages, and UI components
- `backend/`: FastAPI app, routers, schemas, models, and database setup
- `notes/`: planning artifacts

## Key Backend Endpoints

- `GET /health`: backend health check
- `GET /prices`: latest BTC, ETH, and SOL prices
- `GET /wallet`: current virtual balance
- `POST /trades/open`: open a new position
- `GET /trades/positions`: list open positions
- `POST /trades/close`: close an open position

## Getting Started

### 1. Backend

Create a virtual environment, install dependencies, and set `DATABASE_URL`.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="your-database-url"
uvicorn app.main:app --reload
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Open the app

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- FastAPI docs: `http://localhost:8000/docs`

## Notes

- The current frontend calls `http://localhost:8000` directly.
- The current backend price feed uses CoinGecko polling rather than Binance WebSockets.
- The database connection is environment-driven through `DATABASE_URL`.
