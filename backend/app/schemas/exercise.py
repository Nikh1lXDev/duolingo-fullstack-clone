from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal

class ExerciseBase(BaseModel):
    type: Literal["multiple_choice", "translate", "word_bank", "match_pairs", "fill_blank", "type_answer"]
    prompt: str
    correct_answer: str
    options: Optional[str] = None
    translation: Optional[str] = None
    order_index: int
    xp_reward: int

class Exercise(ExerciseBase):
    id: int
    lesson_id: int
    
    model_config = ConfigDict(from_attributes=True)
