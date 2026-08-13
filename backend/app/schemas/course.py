from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

class CourseBase(BaseModel):
    name: str
    language: str
    description: Optional[str] = None
    icon: Optional[str] = None
    is_active: bool
    created_at: datetime

class Course(CourseBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)
