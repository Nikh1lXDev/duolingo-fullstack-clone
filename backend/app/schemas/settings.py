from pydantic import BaseModel
from typing import Optional

class UserSettingsUpdate(BaseModel):
    sound_enabled: Optional[bool] = None
    notifications_enabled: Optional[bool] = None
    course_language: Optional[str] = None
    course_id: Optional[int] = None
    proficiency_level: Optional[str] = None
    onboarding_completed: Optional[bool] = None
    placement_completed: Optional[bool] = None
    placement_score: Optional[int] = None
    starting_level: Optional[str] = None
    avatar_config: Optional[str] = None  # JSON string

class UserSettingsResponse(BaseModel):
    sound_enabled: bool
    notifications_enabled: bool
    course_language: Optional[str] = "es"
    course_id: Optional[int] = None
    proficiency_level: Optional[str] = None
    onboarding_completed: bool = False
    placement_completed: bool = False
    placement_score: Optional[int] = None
    starting_level: Optional[str] = None
    avatar_config: Optional[str] = None  # JSON string
