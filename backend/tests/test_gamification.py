import pytest
from datetime import datetime, timedelta, timezone, date
from app.services.gamification import calculate_regeneration, get_user_stats, deduct_heart, refill_hearts, process_lesson_completion, GamificationError
from app.models.user import UserStats, User
from app.models.lesson import Lesson
from app.models.progress import UserLessonProgress

def test_heart_regeneration_basic():
    stats = UserStats(hearts=0, last_heart_refill_at=datetime.now(timezone.utc) - timedelta(minutes=30))
    calculate_regeneration(stats, datetime.now(timezone.utc))
    assert stats.hearts == 1

def test_heart_regeneration_multiple():
    now = datetime.now(timezone.utc)
    stats = UserStats(hearts=1, last_heart_refill_at=now - timedelta(minutes=130)) # 2 hours 10 mins = 4 hearts, 10 mins remainder
    calculate_regeneration(stats, now)
    assert stats.hearts == 5
    # The anchor should be shifted forward by 120 mins (4 * 30), so 10 mins ago
    assert (now - stats.last_heart_refill_at).total_seconds() <= 600

def test_heart_regeneration_cap():
    now = datetime.now(timezone.utc)
    stats = UserStats(hearts=3, last_heart_refill_at=now - timedelta(minutes=100)) # 3 hearts + 3 = 6
    calculate_regeneration(stats, now)
    assert stats.hearts == 5
    # When hitting 5, anchor should snap to now
    assert stats.last_heart_refill_at == now

def test_deduct_heart(db_session):
    stats = get_user_stats(db_session, 1)
    stats.hearts = 5
    db_session.commit()
    
    # Deduct 1
    new_stats = deduct_heart(db_session, 1, "deduct_1")
    assert new_stats.hearts == 4
    assert new_stats.last_heart_deduction_id == "deduct_1"
    
    # Duplicate request, idempotent
    dup_stats = deduct_heart(db_session, 1, "deduct_1")
    assert dup_stats.hearts == 4
    
    # Deduct to zero
    deduct_heart(db_session, 1, "deduct_2")
    deduct_heart(db_session, 1, "deduct_3")
    deduct_heart(db_session, 1, "deduct_4")
    final_stats = deduct_heart(db_session, 1, "deduct_5")
    assert final_stats.hearts == 0
    
    with pytest.raises(GamificationError):
        deduct_heart(db_session, 1, "deduct_6")

def test_refill_hearts(db_session):
    stats = get_user_stats(db_session, 1)
    stats.hearts = 0
    stats.gems = 1000
    db_session.commit()
    
    # Refill
    new_stats = refill_hearts(db_session, 1)
    assert new_stats.hearts == 5
    
    # Try refill when full
    dup_stats = refill_hearts(db_session, 1)
    assert dup_stats.gems == new_stats.gems # No gems deducted

def test_process_lesson_completion_streak_and_xp(db_session):
    now = datetime.now(timezone.utc)
    
    stats_before = get_user_stats(db_session, 1)
    stats_before.xp = 0
    stats_before.daily_xp_progress = 0
    stats_before.daily_xp_date = None
    stats_before.streak = 0
    stats_before.longest_streak = 0
    stats_before.last_activity_date = None
    db_session.commit()
    
    # Reset lesson progress for lesson 1, 2, 3, 4
    for lid in [1, 2, 3, 4]:
        prog = db_session.query(UserLessonProgress).filter_by(user_id=1, lesson_id=lid).first()
        if prog:
            prog.xp_awarded = False
    db_session.commit()
    
    # Process completion
    prog = process_lesson_completion(db_session, 1, 1, 100, current_time=now)
    assert prog.completed is True
    assert prog.xp_awarded is True
    
    stats_after = get_user_stats(db_session, 1)
    assert stats_after.xp == 15 # 10 + 5 perfect bonus
    assert stats_after.daily_xp_progress == 15
    assert stats_after.streak == 1 # First activity
    assert stats_after.longest_streak == 1
    
    # Same day completion (lesson 2)
    process_lesson_completion(db_session, 1, 2, 80, current_time=now)
    stats_sameday = get_user_stats(db_session, 1)
    assert stats_sameday.xp == 25 # +10
    assert stats_sameday.daily_xp_progress == 25
    assert stats_sameday.streak == 1 # Still 1
    
    # Next day completion
    next_day = now + timedelta(days=1)
    process_lesson_completion(db_session, 1, 3, 100, current_time=next_day)
    stats_nextday = get_user_stats(db_session, 1)
    assert stats_nextday.streak == 2
    assert stats_nextday.longest_streak == 2
    assert stats_nextday.daily_xp_progress == 15 # Reset on new day
    
    # Missed day
    missed_day = now + timedelta(days=3)
    process_lesson_completion(db_session, 1, 4, 100, current_time=missed_day)
    stats_missed = get_user_stats(db_session, 1)
    assert stats_missed.streak == 1 # Reset!
    assert stats_missed.longest_streak == 2 # Preserved
