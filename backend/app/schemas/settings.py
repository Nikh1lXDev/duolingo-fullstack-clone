from pydantic import BaseModel
from typing import Optional

class UserSettingsUpdate(BaseModel):
    sound_enabled: bool
    notifications_enabled: bool
    course_language: Optional[str] = "es"
    course_id: Optional[int] = None

class UserSettingsResponse(BaseModel):
    sound_enabled: bool
    notifications_enabled: bool
    course_language: Optional[str] = "es"
    course_id: Optional[int] = 1
