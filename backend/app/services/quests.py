from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.progress import UserLessonProgress
from app.services.gamification import get_user_stats

def get_daily_quests(db: Session, user_id: int, current_time: datetime = None):
    now = current_time or datetime.now(timezone.utc)
    today = now.date()
    
    stats = get_user_stats(db, user_id, now)
    
    current_daily_xp = stats.daily_xp_progress if stats.daily_xp_date == today else 0
    
    quest1 = {
        "id": "daily-xp",
        "title": "Earn XP",
        "description": "Earn today's XP goal",
        "target": stats.daily_xp_goal,
        "progress": current_daily_xp,
        "completed": current_daily_xp >= stats.daily_xp_goal,
        "reward_xp": 10
    }
    
    lessons_prog = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user_id,
        UserLessonProgress.completed == True
    ).all()
    
    count_today = 0
    for lp in lessons_prog:
        if lp.completed_at:
            dt = lp.completed_at
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            if dt.date() == today:
                count_today += 1
                
    target_lessons = 3
    quest2 = {
        "id": "daily-lessons",
        "title": "Complete Lessons",
        "description": f"Complete {target_lessons} lessons today",
        "target": target_lessons,
        "progress": count_today,
        "completed": count_today >= target_lessons,
        "reward_xp": 20
    }
    
    return [quest1, quest2]
