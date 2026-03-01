// components/TradeForm.jsx
"use client";

import { useState, useEffect } from "react";

const COINS = [
  { symbol: "BTC", name: "Bitcoin", color: "#F7931A" },
  { symbol: "ETH", name: "Ethereum", color: "#627EEA" },
  { symbol: "SOL", name: "Solana", color: "#14F195" },
];
const LEVERAGE_OPTIONS = [1, 5, 10, 25];

export default function TradeForm({ onTradeComplete }) {
  const [coin, setCoin] = useState("BTC");
  const [side, setSide] = useState("long");
  const [amount, setAmount] = useState("");
  const [leverage, setLeverage] = useState(1);
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [prices, setPrices] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch live prices so user sees entry price before trading
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("http://localhost:8000/prices");
        const data = await res.json();
        setPrices(data);
      } catch {
        /* silent */
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentPrice = prices[coin]?.price;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const body = {
        coin,
        side,
        amount_usd: parseFloat(amount),
        leverage,
      };
      if (stopLoss) body.stop_loss = parseFloat(stopLoss);
      if (takeProfit) body.take_profit = parseFloat(takeProfit);

      const res = await fetch("http://localhost:8000/trades/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Trade failed");
      }

      const data = await res.json();
      setSuccess(data.message);
      setAmount("");
      setStopLoss("");
      setTakeProfit("");
      if (onTradeComplete) onTradeComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="trade-form" onSubmit={handleSubmit}>
      <h2 className="trade-form-title">Open Position</h2>

      {/* Coin selector */}
      <div className="form-group">
        <label className="form-label">Asset</label>
        <div className="coin-selector">
          {COINS.map((c) => (
            <button
              key={c.symbol}
              type="button"
              className={`coin-btn ${coin === c.symbol ? "active" : ""}`}
              style={{ "--coin-color": c.color }}
              onClick={() => setCoin(c.symbol)}
            >
              {c.symbol}
            </button>
          ))}
        </div>
        {currentPrice && (
          <span className="current-price-hint">
            Current: $
            {currentPrice.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
        )}
      </div>

      {/* Side selector */}
      <div className="form-group">
        <label className="form-label">Direction</label>
        <div className="side-selector">
          <button
            type="button"
            className={`side-btn long ${side === "long" ? "active" : ""}`}
            onClick={() => setSide("long")}
          >
            Long
          </button>
          <button
            type="button"
            className={`side-btn short ${side === "short" ? "active" : ""}`}
            onClick={() => setSide("short")}
          >
            Short
          </button>
        </div>
      </div>

      {/* Amount */}
      <div className="form-group">
        <label className="form-label">Amount (USD)</label>
        <input
          type="number"
          className="form-input"
          placeholder="e.g. 500"
          min="1"
          step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      {/* Leverage */}
      <div className="form-group">
        <label className="form-label">Leverage</label>
        <div className="leverage-selector">
          {LEVERAGE_OPTIONS.map((lev) => (
            <button
              key={lev}
              type="button"
              className={`leverage-btn ${leverage === lev ? "active" : ""}`}
              onClick={() => setLeverage(lev)}
            >
              {lev}x
            </button>
          ))}
        </div>
      </div>

      {/* Stop Loss / Take Profit */}
      <div className="form-row">
        <div className="form-group half">
          <label className="form-label">Stop Loss</label>
          <input
            type="number"
            className="form-input"
            placeholder="Optional"
            step="any"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
          />
        </div>
        <div className="form-group half">
          <label className="form-label">Take Profit</label>
          <input
            type="number"
            className="form-input"
            placeholder="Optional"
            step="any"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className={`trade-submit-btn ${side}`}
        disabled={submitting || !amount}
      >
        {submitting
          ? "Opening..."
          : `Open ${side === "long" ? "Long" : "Short"} Position`}
      </button>

      {/* Feedback */}
      {error && <p className="trade-error">{error}</p>}
      {success && <p className="trade-success">{success}</p>}
    </form>
  );
}
