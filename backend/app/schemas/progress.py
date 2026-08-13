from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class UserSkillProgressBase(BaseModel):
    completed: bool
    progress: int
    crowns: int
    lessons_completed: int
    updated_at: datetime

class UserSkillProgress(UserSkillProgressBase):
    id: int
    user_id: int
    skill_id: int
    
    model_config = ConfigDict(from_attributes=True)

class UserLessonProgressBase(BaseModel):
    completed: bool
    progress: int
    attempts: int
    score: int
    xp_awarded: bool = False
    completed_at: Optional[datetime] = None
    updated_at: datetime

class UserLessonProgress(UserLessonProgressBase):
    id: int
    user_id: int
    lesson_id: int
    
    model_config = ConfigDict(from_attributes=True)

class UserLessonProgressUpdate(BaseModel):
    completed: bool
    score: int
