import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import String, Float, DateTime, Integer, Enum as SAEnum
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class PositionSide(str, enum.Enum):
    long = "long"
    short = "short"


class PositionStatus(str, enum.Enum):
    open = "open"
    closed = "closed"


class Wallet(Base):
    __tablename__ = "wallet"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    balance: Mapped[float] = mapped_column(Float, nullable=False, default=10000.0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class Position(Base):
    __tablename__ = "positions"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    coin: Mapped[str] = mapped_column(String(10), nullable=False)
    side: Mapped[PositionSide] = mapped_column(SAEnum(PositionSide), nullable=False)
    leverage: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    amount_usd: Mapped[float] = mapped_column(Float, nullable=False)
    entry_price: Mapped[float] = mapped_column(Float, nullable=False)
    stop_loss: Mapped[float | None] = mapped_column(Float, nullable=True)
    take_profit: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[PositionStatus] = mapped_column(
        SAEnum(PositionStatus), nullable=False, default=PositionStatus.open
    )
    opened_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    closed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    close_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    pnl: Mapped[float | None] = mapped_column(Float, nullable=True)
