from sqlalchemy.orm import Session
from app.models.user import UserSettings
from app.models.course import Course
from app.schemas.settings import UserSettingsUpdate

def get_user_settings(db: Session, user_id: int) -> UserSettings:
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        default_course = db.query(Course).filter(Course.is_active == True).first()
        default_course_id = default_course.id if default_course else None
        
        settings = UserSettings(
            user_id=user_id,
            sound_enabled=True,
            notifications_enabled=True,
            course_language="es",
            course_id=None,       # Don't auto-assign; requires onboarding
            onboarding_completed=False,
            placement_completed=False,
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    elif settings.course_id and settings.onboarding_completed is None:
        # Legacy user with course_id but no onboarding_completed field — mark complete
        settings.onboarding_completed = True
        db.commit()
        db.refresh(settings)
    elif not settings.course_id and settings.onboarding_completed:
        pass  # onboarding marked complete but course lost — keep state as-is
            
    return settings

def update_user_settings(db: Session, user_id: int, payload: UserSettingsUpdate):
    # Ensure settings row exists (auto-creates with defaults if missing)
    settings = get_user_settings(db, user_id)
        
    update_data = payload.model_dump(exclude_unset=True)
    if "course_id" in update_data and update_data["course_id"] is not None:
        from app.models.course import Course
        course = db.query(Course).filter(Course.id == update_data["course_id"], Course.is_active == True).first()
        if not course:
            raise ValueError(f"Course ID {update_data['course_id']} is invalid or inactive")
        update_data["course_language"] = course.target_language
        
    for key, value in update_data.items():
        setattr(settings, key, value)
        
    db.commit()
    db.refresh(settings)
    return settings
