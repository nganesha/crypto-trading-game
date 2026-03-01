from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import Wallet, Position, PositionSide, PositionStatus
from app.schemas import OpenTradeRequest, CloseTradeRequest, TradeResultResponse, PositionResponse

router = APIRouter(prefix="/trades", tags=["trades"])


@router.post("/open", response_model=TradeResultResponse)
async def open_trade(req: OpenTradeRequest, db: AsyncSession = Depends(get_db)):
    """
    Open a new trading position.
    Checks balance, reads live price, deducts from wallet, creates position.
    """
    from app.main import prices

    # Check balance
    result = await db.execute(select(Wallet).where(Wallet.id == 1))
    wallet = result.scalar_one()
    if wallet.balance < req.amount_usd:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient balance. Have ${wallet.balance:.2f}, need ${req.amount_usd:.2f}",
        )

    # Get current price
    current = prices.get(req.coin)
    if not current or current["price"] is None:
        raise HTTPException(status_code=503, detail=f"Price for {req.coin} not available yet")

    entry_price = current["price"]

    # Deduct from wallet and create position
    wallet.balance -= req.amount_usd

    position = Position(
        coin=req.coin,
        side=PositionSide(req.side),
        leverage=req.leverage,
        amount_usd=req.amount_usd,
        entry_price=entry_price,
        stop_loss=req.stop_loss,
        take_profit=req.take_profit,
    )
    db.add(position)
    await db.commit()
    await db.refresh(wallet)
    await db.refresh(position)

    return TradeResultResponse(
        message=f"Opened {req.side} {req.coin} position at ${entry_price:,.2f}",
        position=PositionResponse.model_validate(position),
        new_balance=wallet.balance,
    )


@router.get("/positions", response_model=list[PositionResponse])
async def get_positions(db: AsyncSession = Depends(get_db)):
    """Return all open positions, newest first."""
    result = await db.execute(
        select(Position)
        .where(Position.status == "open")
        .order_by(Position.opened_at.desc())
    )
    return result.scalars().all()


@router.post("/close", response_model=TradeResultResponse)
async def close_trade(req: CloseTradeRequest, db: AsyncSession = Depends(get_db)):
    """
    Close an open position at the current live price.
    Calculates final P&L, updates position, and credits wallet.
    """
    from app.main import prices
    from datetime import datetime, timezone

    # Look up position
    result = await db.execute(select(Position).where(Position.id == req.position_id))
    position = result.scalar_one_or_none()
    if position is None:
        raise HTTPException(status_code=404, detail="Position not found")
    if position.status != PositionStatus.open:
        raise HTTPException(status_code=400, detail="Position is already closed")

    # Get current live price
    current = prices.get(position.coin)
    if not current or current["price"] is None:
        raise HTTPException(status_code=503, detail=f"Price for {position.coin} not available")
    close_price = current["price"]

    # Calculate P&L
    direction = 1 if position.side == PositionSide.long else -1
    price_change = (close_price - position.entry_price) / position.entry_price
    pnl = position.amount_usd * price_change * direction * position.leverage

    # Update position record
    position.status = PositionStatus.closed
    position.close_price = close_price
    position.closed_at = datetime.now(timezone.utc)
    position.pnl = pnl

    # Credit wallet: return margin + P&L
    wallet_result = await db.execute(select(Wallet).where(Wallet.id == 1))
    wallet = wallet_result.scalar_one()
    wallet.balance += position.amount_usd + pnl

    await db.commit()
    await db.refresh(wallet)
    await db.refresh(position)

    pnl_label = f"+${pnl:.2f}" if pnl >= 0 else f"-${abs(pnl):.2f}"
    return TradeResultResponse(
        message=f"Closed {position.coin} position at ${close_price:,.2f} — P&L: {pnl_label}",
        position=PositionResponse.model_validate(position),
        new_balance=wallet.balance,
    )
