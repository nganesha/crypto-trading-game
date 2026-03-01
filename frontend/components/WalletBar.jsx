// components/WalletBar.jsx
"use client";

import { useState, useEffect } from "react";

export default function WalletBar({ refreshKey }) {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/wallet")
      .then((res) => res.json())
      .then((data) => setBalance(data.balance))
      .catch(() => setBalance(null));
  }, [refreshKey]);

  return (
    <div className="wallet-bar">
      <span className="wallet-label">Virtual Balance</span>
      <span className="wallet-amount">
        {balance !== null
          ? "$" +
            balance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "Loading..."}
      </span>
    </div>
  );
}
