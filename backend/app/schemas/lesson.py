from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class LessonBase(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: int
    xp_reward: int
    difficulty: str

class Lesson(LessonBase):
    id: int
    skill_id: int
    
    model_config = ConfigDict(from_attributes=True)
