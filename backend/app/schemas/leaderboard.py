from pydantic import BaseModel
from typing import List, Optional

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    display_name: Optional[str] = None
    avatar: Optional[str] = None
    xp: int
    streak: int

class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]
    current_user_rank: Optional[int] = None
