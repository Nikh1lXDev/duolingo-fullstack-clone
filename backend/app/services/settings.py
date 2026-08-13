from sqlalchemy.orm import Session
from app.models.user import UserSettings
from app.schemas.settings import UserSettingsUpdate

def get_user_settings(db: Session, user_id: int) -> UserSettings:
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        settings = UserSettings(
            user_id=user_id,
            sound_enabled=True,
            notifications_enabled=True,
            course_language="es"
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

def update_user_settings(db: Session, user_id: int, payload: UserSettingsUpdate) -> UserSettings:
    settings = get_user_settings(db, user_id)
    settings.sound_enabled = payload.sound_enabled
    settings.notifications_enabled = payload.notifications_enabled
    settings.course_language = payload.course_language
    
    db.commit()
    db.refresh(settings)
    return settings
