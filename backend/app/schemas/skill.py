from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class SkillBase(BaseModel):
    title: str
    description: Optional[str] = None
    icon: Optional[str] = None
    order_index: int
    is_locked: bool
    xp_reward: int

class Skill(SkillBase):
    id: int
    unit_id: int
    
    model_config = ConfigDict(from_attributes=True)
