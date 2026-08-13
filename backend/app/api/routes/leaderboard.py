from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.leaderboard import LeaderboardResponse
from app.services.leaderboard import get_leaderboard

router = APIRouter()

@router.get("", response_model=LeaderboardResponse)
def get_leaderboard_route(user_id: int = Query(1, alias="userId"), db: Session = Depends(get_db)):
    return get_leaderboard(db, user_id)
