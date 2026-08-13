from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.user import User
from app.models.skill import Skill
from app.models.lesson import Lesson
from app.models.progress import UserSkillProgress, UserLessonProgress
from app.services.gamification import get_user_stats

def get_user_profile(db: Session, user_id: int, current_time: datetime = None):
    now = current_time or datetime.now(timezone.utc)
    today = now.date()
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
        
    stats = get_user_stats(db, user_id, now)
    
    current_daily_xp = stats.daily_xp_progress if stats.daily_xp_date == today else 0
    
    total_skills = db.query(Skill).count()
    completed_skills = db.query(UserSkillProgress).filter(
        UserSkillProgress.user_id == user_id,
        UserSkillProgress.completed == True
    ).count()
    
    total_lessons = db.query(Lesson).count()
    completed_lessons = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user_id,
        UserLessonProgress.completed == True
    ).count()
    
    course_progress = 0
    if total_skills > 0:
        course_progress = int((completed_skills / total_skills) * 100)
        
    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "avatar": user.avatar
        },
        "stats": {
            "xp": stats.xp,
            "gems": stats.gems,
            "hearts": stats.hearts,
            "streak": stats.streak,
            "longest_streak": stats.longest_streak,
            "daily_xp_goal": stats.daily_xp_goal,
            "daily_xp_progress": current_daily_xp,
            "lessons_completed": stats.lessons_completed
        },
        "progress": {
            "skills_completed": completed_skills,
            "total_skills": total_skills,
            "lessons_completed": completed_lessons,
            "total_lessons": total_lessons,
            "course_progress": course_progress
        }
    }
