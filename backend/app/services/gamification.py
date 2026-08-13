from sqlalchemy.orm import Session
from datetime import datetime, timezone, date
from app.models.user import User, UserStats
from app.models.lesson import Lesson
from app.models.skill import Skill
from app.models.progress import UserLessonProgress, UserSkillProgress

class GamificationError(Exception):
    pass

def _get_time(current_time: datetime = None) -> datetime:
    return current_time or datetime.now(timezone.utc)

def calculate_regeneration(stats: UserStats, current_time: datetime = None):
    """
    Recalculates hearts based on time elapsed.
    1 heart per 30 minutes, max 5 hearts.
    Updates stats inline.
    """
    if stats.hearts >= 5:
        return
        
    now = _get_time(current_time)
    
    if not stats.last_heart_refill_at:
        stats.last_heart_refill_at = now
        return
        
    anchor = stats.last_heart_refill_at
    if anchor.tzinfo is None:
        anchor = anchor.replace(tzinfo=timezone.utc)
        
    delta = now - anchor
    minutes_passed = int(delta.total_seconds() // 60)
    
    if minutes_passed >= 30:
        hearts_to_add = minutes_passed // 30
        new_hearts = min(5, stats.hearts + hearts_to_add)
        actual_added = new_hearts - stats.hearts
        
        stats.hearts = new_hearts
        
        if actual_added > 0:
            import datetime as dt
            if stats.hearts == 5:
                stats.last_heart_refill_at = now
            else:
                stats.last_heart_refill_at += dt.timedelta(minutes=(hearts_to_add * 30))

def get_user_stats(db: Session, user_id: int, current_time: datetime = None) -> UserStats:
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not stats:
        raise GamificationError("User stats not found")
        
    calculate_regeneration(stats, current_time)
    db.commit()
    db.refresh(stats)
    return stats

def deduct_heart(db: Session, user_id: int, deduction_id: str, current_time: datetime = None) -> UserStats:
    stats = get_user_stats(db, user_id, current_time)
    
    if stats.last_heart_deduction_id == deduction_id:
        return stats
        
    if stats.hearts <= 0:
        raise GamificationError("No hearts remaining")
        
    stats.hearts -= 1
    stats.last_heart_deduction_id = deduction_id
    
    if stats.hearts == 4:
        stats.last_heart_refill_at = _get_time(current_time)
        
    db.commit()
    db.refresh(stats)
    return stats

def refill_hearts(db: Session, user_id: int, current_time: datetime = None) -> UserStats:
    stats = get_user_stats(db, user_id, current_time)
    
    if stats.hearts >= 5:
        return stats
        
    if stats.gems < 500:
        raise GamificationError("Insufficient gems")
        
    stats.gems -= 500
    stats.hearts = 5
    stats.last_heart_refill_at = _get_time(current_time)
    
    db.commit()
    db.refresh(stats)
    return stats

def process_lesson_completion(db: Session, user_id: int, lesson_id: int, score: int, current_time: datetime = None) -> UserLessonProgress:
    now = _get_time(current_time)
    today = now.date()
    
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise GamificationError("Lesson not found")
        
    stats = get_user_stats(db, user_id, now)
    
    lesson_prog = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user_id,
        UserLessonProgress.lesson_id == lesson_id
    ).first()
    
    if not lesson_prog:
        lesson_prog = UserLessonProgress(
            user_id=user_id,
            lesson_id=lesson_id,
            completed=False,
            progress=0,
            attempts=0,
            score=0,
            xp_awarded=False
        )
        db.add(lesson_prog)
        
    if lesson_prog.xp_awarded:
        # Strict idempotency: do not increment anything on a duplicate request
        return lesson_prog
        
    lesson_prog.completed = True
    lesson_prog.progress = 100
    lesson_prog.attempts += 1
    lesson_prog.score = score
    lesson_prog.xp_awarded = True
    lesson_prog.completed_at = now
    
    earned_xp = 10
    if score == 100:
        earned_xp += 5
        
    stats.xp += earned_xp
    stats.lessons_completed += 1
    
    if stats.daily_xp_date != today:
        stats.daily_xp_progress = 0
        stats.daily_xp_date = today
        
    stats.daily_xp_progress += earned_xp
    
    if stats.last_activity_date != today:
        if stats.last_activity_date:
            import datetime as dt
            delta = today - stats.last_activity_date
            if delta.days == 1:
                stats.streak += 1
            else:
                stats.streak = 1
        else:
            stats.streak = 1
            
        stats.last_activity_date = today
        
        if stats.streak > stats.longest_streak:
            stats.longest_streak = stats.streak
            
    skill_prog = db.query(UserSkillProgress).filter(
        UserSkillProgress.user_id == user_id,
        UserSkillProgress.skill_id == lesson.skill_id
    ).first()
    
    if not skill_prog:
        skill_prog = UserSkillProgress(
            user_id=user_id,
            skill_id=lesson.skill_id,
            completed=False,
            progress=0,
            crowns=0,
            lessons_completed=0
        )
        db.add(skill_prog)
        
    db.flush()
    
    all_lessons = db.query(Lesson).filter(Lesson.skill_id == lesson.skill_id).all()
    all_lesson_ids = [l.id for l in all_lessons]
    
    completed_progresses = db.query(UserLessonProgress).filter(
        UserLessonProgress.user_id == user_id,
        UserLessonProgress.lesson_id.in_(all_lesson_ids),
        UserLessonProgress.completed == True
    ).all()
    
    completed_count = len(completed_progresses)
    total_lessons = len(all_lessons)
    
    skill_prog.lessons_completed = completed_count
    if total_lessons > 0:
        skill_prog.progress = int((completed_count / total_lessons) * 100)
    else:
        skill_prog.progress = 100
        
    if completed_count >= total_lessons and not skill_prog.completed:
        skill_prog.completed = True
        skill_prog.crowns += 1
        skill_prog.completed_at = now
        
    db.commit()
    db.refresh(lesson_prog)
    return lesson_prog
