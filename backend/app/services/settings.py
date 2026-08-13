from sqlalchemy.orm import Session
from app.models.user import UserSettings
from app.models.course import Course
from app.schemas.settings import UserSettingsUpdate

def get_user_settings(db: Session, user_id: int) -> UserSettings:
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        default_course = db.query(Course).filter(Course.is_active == True).first()
        default_course_id = default_course.id if default_course else 1
        
        settings = UserSettings(
            user_id=user_id,
            sound_enabled=True,
            notifications_enabled=True,
            course_language="es",
            course_id=default_course_id
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    elif not settings.course_id:
        default_course = db.query(Course).filter(Course.is_active == True).first()
        if default_course:
            settings.course_id = default_course.id
            db.commit()
            db.refresh(settings)
            
    return settings

def update_user_settings(db: Session, user_id: int, payload: UserSettingsUpdate) -> UserSettings:
    settings = get_user_settings(db, user_id)
    settings.sound_enabled = payload.sound_enabled
    settings.notifications_enabled = payload.notifications_enabled
    
    if payload.course_id:
        course = db.query(Course).filter(Course.id == payload.course_id, Course.is_active == True).first()
        if not course:
            raise ValueError(f"Course ID {payload.course_id} is invalid or inactive")
        settings.course_id = course.id
        settings.course_language = course.target_language
    elif payload.course_language:
        settings.course_language = payload.course_language
    
    db.commit()
    db.refresh(settings)
    return settings
