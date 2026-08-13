from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class UnitBase(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: int
    is_locked: bool

class Unit(UnitBase):
    id: int
    course_id: int
    
    model_config = ConfigDict(from_attributes=True)
