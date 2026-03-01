// app/trade/page.jsx
"use client";

import { useState } from "react";
import WalletBar from "@/components/WalletBar";
import TradeForm from "@/components/TradeForm";
import OpenPositions from "@/components/OpenPositions";

export default function TradePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTradeComplete = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="trade-page">
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Trade</h1>
          <p className="page-subtitle">Open leveraged positions</p>
        </div>
      </div>

      <WalletBar refreshKey={refreshKey} />

      <div className="trade-layout">
        <TradeForm onTradeComplete={handleTradeComplete} />
        <OpenPositions refreshKey={refreshKey} onTradeComplete={handleTradeComplete} />
      </div>
    </div>
  );
}
