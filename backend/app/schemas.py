from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class WalletResponse(BaseModel):
    balance: float
    updated_at: datetime

    model_config = {"from_attributes": True}


class OpenTradeRequest(BaseModel):
    coin: Literal["BTC", "ETH", "SOL"]
    amount_usd: float = Field(gt=0, description="Dollar amount to invest")
    side: Literal["long", "short"]
    leverage: Literal[1, 5, 10, 25] = 1
    stop_loss: float | None = None
    take_profit: float | None = None


class CloseTradeRequest(BaseModel):
    position_id: str


class PositionResponse(BaseModel):
    id: str
    coin: str
    side: str
    leverage: int
    amount_usd: float
    entry_price: float
    stop_loss: float | None
    take_profit: float | None
    status: str
    opened_at: datetime
    closed_at: datetime | None = None
    close_price: float | None = None
    pnl: float | None = None

    model_config = {"from_attributes": True}


class TradeResultResponse(BaseModel):
    message: str
    position: PositionResponse
    new_balance: float
