from pydantic import BaseModel
from typing import Optional

class VocabularyItemBase(BaseModel):
    source_text: str
    target_text: str
    category: Optional[str] = "general"
    difficulty: Optional[int] = 1
    pronunciation: Optional[str] = None

class VocabularyItemCreate(VocabularyItemBase):
    course_id: int
    skill_id: Optional[int] = None

class VocabularyItemSchema(VocabularyItemBase):
    id: int
    course_id: int
    skill_id: Optional[int] = None

    class Config:
        from_attributes = True
