from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import Optional

class UserStatsBase(BaseModel):
    xp: int
    gems: int
    hearts: int
    streak: int
    longest_streak: int
    daily_xp_goal: int
    daily_xp_progress: int
    daily_xp_date: Optional[date] = None
    last_heart_refill_at: Optional[datetime] = None
    last_heart_deduction_id: Optional[str] = None
    lessons_completed: int
    last_activity_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

class UserStats(UserStatsBase):
    id: int
    user_id: int
    
    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    username: str
    email: str
    display_name: Optional[str] = None
    avatar: Optional[str] = None
    created_at: datetime

class User(UserBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

class UserProfile(User):
    stats: UserStats
    
    model_config = ConfigDict(from_attributes=True)
