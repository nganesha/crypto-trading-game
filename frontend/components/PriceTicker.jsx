// components/PriceTicker.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import Sparkline from "./Sparkline";

const COINS = {
  BTC: { name: "Bitcoin",  color: "#F7931A", bg: "rgba(247,147,26,0.08)",  symbol: "BTC" },
  ETH: { name: "Ethereum", color: "#627EEA", bg: "rgba(98,126,234,0.08)",  symbol: "ETH" },
  SOL: { name: "Solana",   color: "#14F195", bg: "rgba(20,241,149,0.08)",  symbol: "SOL" },
};

const MAX_HISTORY = 20;

function formatPrice(price, ticker) {
  if (price === null || price === undefined) return "—";
  if (ticker === "BTC") {
    return "$" + price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return "$" + price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function CoinCard({ ticker, data, history, flash }) {
  const coin = COINS[ticker];
  const price = data?.price;
  const change = data?.change;
  const isUp = change >= 0;

  return (
    <div
      className={"coin-card " + flash}
      style={{ "--card-color": coin.color, "--card-bg": coin.bg }}
    >
      <div className="card-top">
        <div className="card-identity">
          <span className="card-ticker">{ticker}</span>
          <span className="card-name">{coin.name}</span>
        </div>
        <div className={"change-badge " + (change === null || change === undefined ? "neutral" : isUp ? "up" : "down")}>
          {change !== null && change !== undefined ? (
            <>{isUp ? "↑" : "↓"} {Math.abs(change).toFixed(2)}%</>
          ) : "—"}
        </div>
      </div>

      <div className="card-price">
        {price !== null && price !== undefined ? (
          <span className="price-number">{formatPrice(price, ticker)}</span>
        ) : (
          <span className="price-loading">Connecting…</span>
        )}
      </div>

      <div className="card-sparkline">
        <Sparkline data={history} color={coin.color} width={180} height={48} />
        <span className="sparkline-label">24h trend</span>
      </div>

      <div className="card-glow" />
    </div>
  );
}

export default function PriceTicker() {
  const [prices, setPrices] = useState({
    BTC: { price: null, change: null },
    ETH: { price: null, change: null },
    SOL: { price: null, change: null },
  });
  const [history, setHistory] = useState({ BTC: [], ETH: [], SOL: [] });
  const [flashes, setFlashes] = useState({ BTC: "", ETH: "", SOL: "" });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [status, setStatus] = useState("connecting");
  const prevPrices = useRef({});

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("http://localhost:8000/prices");
        if (!res.ok) throw new Error("Bad response");
        const data = await res.json();

        const newFlashes = {};
        for (const ticker of ["BTC", "ETH", "SOL"]) {
          const prev = prevPrices.current[ticker]?.price;
          const curr = data[ticker]?.price;
          if (prev && curr) {
            newFlashes[ticker] = curr > prev ? "flash-up" : curr < prev ? "flash-down" : "";
          } else {
            newFlashes[ticker] = "";
          }
        }

        setHistory((prev) => {
          const updated = { ...prev };
          for (const ticker of ["BTC", "ETH", "SOL"]) {
            const p = data[ticker]?.price;
            if (p !== null && p !== undefined) {
              updated[ticker] = [...prev[ticker], p].slice(-MAX_HISTORY);
            }
          }
          return updated;
        });

        prevPrices.current = data;
        setPrices(data);
        setFlashes(newFlashes);
        setLastUpdated(new Date());
        setStatus("live");

        setTimeout(() => setFlashes({ BTC: "", ETH: "", SOL: "" }), 700);
      } catch (err) {
        console.error("Price fetch failed:", err);
        setStatus("error");
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 2000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <div className="ticker-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Live Prices</h1>
          <p className="page-subtitle">Real-time quotes · CoinGecko</p>
        </div>
        <div className="header-meta">
          <div className={"status-pill " + status}>
            <span className="status-dot-inner" />
            {status === "live" ? "Live" : status === "error" ? "Error" : "Connecting"}
          </div>
          {timeStr && <span className="last-updated">Updated {timeStr}</span>}
        </div>
      </div>

      <div className="cards-grid">
        {Object.entries(prices).map(([ticker, data]) => (
          <CoinCard
            key={ticker}
            ticker={ticker}
            data={data}
            history={history[ticker]}
            flash={flashes[ticker]}
          />
        ))}
      </div>
    </div>
  );
}