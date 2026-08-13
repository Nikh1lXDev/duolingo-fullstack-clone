from pydantic import BaseModel

class UserSettingsUpdate(BaseModel):
    sound_enabled: bool
    notifications_enabled: bool
    course_language: str

class UserSettingsResponse(BaseModel):
    sound_enabled: bool
    notifications_enabled: bool
    course_language: str
