import asyncio
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.database import engine, async_session
from app.models import Base, Wallet
from app.routers import wallet, trades


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Database setup ──
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed wallet if it doesn't exist
    async with async_session() as session:
        result = await session.execute(select(Wallet).where(Wallet.id == 1))
        if result.scalar_one_or_none() is None:
            session.add(Wallet(id=1, balance=10000.0))
            await session.commit()
            print("Wallet seeded with $10,000")

    # ── Price updater ──
    await fetch_prices()
    task = asyncio.create_task(price_updater())
    print("Price updater task started.")
    yield
    task.cancel()


app = FastAPI(lifespan=lifespan)

# Allow Next.js (localhost:3000) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ──
app.include_router(wallet.router)
app.include_router(trades.router)

# ── Shared price store — updated by background task ──
prices = {
    "BTC": {"price": None, "change": None},
    "ETH": {"price": None, "change": None},
    "SOL": {"price": None, "change": None},
}

COINGECKO_URL = (
    "https://api.coingecko.com/api/v3/simple/price"
    "?ids=bitcoin,ethereum,solana"
    "&vs_currencies=usd"
    "&include_24hr_change=true"
)

COIN_MAP = {
    "bitcoin": "BTC",
    "ethereum": "ETH",
    "solana": "SOL",
}


async def fetch_prices():
    """Fetches latest prices from CoinGecko API and updates the shared prices store."""
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            response = await client.get(COINGECKO_URL)
            response.raise_for_status()
            data = response.json()
            for coin_id, coin_data in data.items():
                symbol = COIN_MAP.get(coin_id)
                if symbol:
                    prices[symbol]["price"] = coin_data["usd"]
                    prices[symbol]["change"] = coin_data["usd_24h_change"]
        except Exception as e:
            print(f"Error fetching prices: {e}")


async def price_updater():
    """Background task that polls CoinGecko API every 20 seconds to update prices."""
    while True:
        try:
            await fetch_prices()
        except Exception as e:
            print(f"Error in price_updater: {e}")
        await asyncio.sleep(20)


# ── API Endpoints ───────────────────────────────────────────────────────────

@app.get("/prices")
def get_prices():
    """
    Returns latest prices for BTC, ETH, SOL.
    Polled by the Next.js frontend every 2 seconds.
    """
    return prices


@app.get("/health")
def health_check():
    """Health check endpoint. Returns 200 OK if the backend is running."""
    return {"status": "ok"}
