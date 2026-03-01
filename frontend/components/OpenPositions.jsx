// components/OpenPositions.jsx
"use client";

import { useState, useEffect } from "react";

const COIN_COLORS = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  SOL: "#14F195",
};

export default function OpenPositions({ refreshKey, onTradeComplete }) {
  const [positions, setPositions] = useState([]);
  const [prices, setPrices] = useState({});
  const [closingId, setClosingId] = useState(null);

  const handleClose = async (positionId) => {
    setClosingId(positionId);
    try {
      const res = await fetch("http://localhost:8000/trades/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position_id: positionId }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Failed to close position");
        return;
      }
      if (onTradeComplete) onTradeComplete();
    } catch {
      alert("Network error closing position");
    } finally {
      setClosingId(null);
    }
  };

  useEffect(() => {
    fetch("http://localhost:8000/trades/positions")
      .then((res) => res.json())
      .then(setPositions)
      .catch(() => {});
  }, [refreshKey]);

  // Poll live prices to calculate unrealized P&L
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("http://localhost:8000/prices");
        setPrices(await res.json());
      } catch {
        /* silent */
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 2000);
    return () => clearInterval(interval);
  }, []);

  if (positions.length === 0) {
    return (
      <div className="positions-empty">
        <p className="positions-empty-text">
          No open positions yet. Place your first trade.
        </p>
      </div>
    );
  }

  return (
    <div className="positions-section">
      <h2 className="positions-title">Open Positions</h2>
      <div className="positions-list">
        {positions.map((pos) => {
          const currentPrice = prices[pos.coin]?.price;
          let unrealizedPnl = null;
          let pnlPercent = null;
          if (currentPrice && pos.entry_price) {
            const direction = pos.side === "long" ? 1 : -1;
            const priceChange =
              (currentPrice - pos.entry_price) / pos.entry_price;
            unrealizedPnl =
              pos.amount_usd * priceChange * direction * pos.leverage;
            pnlPercent = priceChange * direction * pos.leverage * 100;
          }
          const isProfit = unrealizedPnl !== null && unrealizedPnl >= 0;

          return (
            <div key={pos.id} className="position-card">
              <div className="position-header">
                <span
                  className="position-coin"
                  style={{ color: COIN_COLORS[pos.coin] }}
                >
                  {pos.coin}
                </span>
                <span className={`position-side ${pos.side}`}>
                  {pos.side.toUpperCase()} {pos.leverage}x
                </span>
              </div>
              <div className="position-details">
                <div className="position-detail">
                  <span className="detail-label">Amount</span>
                  <span className="detail-value">
                    $
                    {pos.amount_usd.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="position-detail">
                  <span className="detail-label">Entry</span>
                  <span className="detail-value">
                    $
                    {pos.entry_price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {unrealizedPnl !== null && (
                  <div className="position-detail">
                    <span className="detail-label">P&L</span>
                    <span
                      className={`detail-value ${isProfit ? "profit" : "loss"}`}
                    >
                      {isProfit ? "+" : ""}${unrealizedPnl.toFixed(2)} (
                      {pnlPercent >= 0 ? "+" : ""}
                      {pnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                )}
              </div>
              <button
                className="close-position-btn"
                onClick={() => handleClose(pos.id)}
                disabled={closingId === pos.id}
              >
                {closingId === pos.id ? "Closing..." : "Close Position"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
