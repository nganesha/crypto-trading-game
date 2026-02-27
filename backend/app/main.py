import json
import threading
import httpx
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow Next.js (localhost:3000) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared price store — updated by background WebSocket threads
prices = {
    "BTC" : {"price": None, "change": None},
    "ETH" : {"price": None, "change": None},
    "SOL" : {"price": None, "change": None},
}

COINGECKO_URL = (
    "https://api.coingecko.com/api/v3/simple/price"
    "?ids=bitcoin,ethereum,solana"
    "&vs_currencies=usd"
    "&include_24hr_change=true"
)

COIN_MAP = {
    "bitcoin":  "BTC",
    "ethereum": "ETH",
    "solana":   "SOL",
}

async def fetch_prices():
    """
    Fetches latest prices from CoinGecko API and updates the shared `prices` store.
    """
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
    """
    Background task that polls CoinGecko API every 2 seconds to update prices.
    """
    while True:
        try:
            await fetch_prices()
        except Exception as e:
            print(f"Error in price_updater: {e}")
        await asyncio.sleep(20)

# ── API Endpoints ───────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    """
    Starts the background price updater task when the FastAPI app starts.
    """
    await fetch_prices()  # Initial fetch to populate prices
    asyncio.create_task(price_updater())
    print("Price updater task started.")


@app.get("/prices")
def get_prices():
    """
    Returns latest prices for BTC, ETH, SOL.
    Polled by the Next.js frontend every 2 seconds.
    
    Response shape:
    {
        "BTC": { "price": 65000.50, "change": 1.23 },
        "ETH": { "price": 3200.10, "change": -0.45 },
        "SOL": { "price": 145.80, "change": 2.10 }
    }
    """
    return prices

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    Returns 200 OK if the backend is running.
    """
    return {"status": "ok"}
"""
@app.get("/")
def root():
    return {"message": "crypto-sim backend is running"}
"""