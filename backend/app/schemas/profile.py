from pydantic import BaseModel
from typing import Optional

class UserBasic(BaseModel):
    id: int
    username: str
    display_name: Optional[str] = None
    avatar: Optional[str] = None

class UserStatsResponse(BaseModel):
    xp: int
    gems: int
    hearts: int
    streak: int
    longest_streak: int
    daily_xp_goal: int
    daily_xp_progress: int
    lessons_completed: int

class UserProgress(BaseModel):
    skills_completed: int
    total_skills: int
    lessons_completed: int
    total_lessons: int
    course_progress: int

class ProfileResponse(BaseModel):
    user: UserBasic
    stats: UserStatsResponse
    progress: UserProgress
