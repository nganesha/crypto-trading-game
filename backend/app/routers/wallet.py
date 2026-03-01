from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import Wallet
from app.schemas import WalletResponse

router = APIRouter(prefix="/wallet", tags=["wallet"])


@router.get("", response_model=WalletResponse)
async def get_wallet(db: AsyncSession = Depends(get_db)):
    """Return the current wallet balance."""
    result = await db.execute(select(Wallet).where(Wallet.id == 1))
    wallet = result.scalar_one()
    return wallet
