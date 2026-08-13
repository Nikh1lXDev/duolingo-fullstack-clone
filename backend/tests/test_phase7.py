import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.models.user import User, UserStats
from app.services.leaderboard import get_leaderboard
from app.services.quests import get_daily_quests
from app.services.profile import get_user_profile
from app.services.gamification import process_lesson_completion
from app.db.seed import seed_data

client = TestClient(app)

def test_seed_idempotency(db_session: Session):
    # Run seed twice to ensure no duplicates or crashes
    seed_data()
    seed_data()
    users = db_session.query(User).count()
    # 1 demo learner + 4 mock = 5 users
    assert users == 5
    
def test_deterministic_leaderboard_ordering(db_session: Session):
    # Add an equal XP tiebreaker user
    u1 = User(username="tie1", email="t1@x", display_name="T1")
    db_session.add(u1)
    db_session.commit()
    db_session.add(UserStats(user_id=u1.id, xp=1000, streak=10))
    
    u2 = User(username="tie2", email="t2@x", display_name="T2")
    db_session.add(u2)
    db_session.commit()
    db_session.add(UserStats(user_id=u2.id, xp=1000, streak=20))
    
    u3 = User(username="tie3", email="t3@x", display_name="T3")
    db_session.add(u3)
    db_session.commit()
    db_session.add(UserStats(user_id=u3.id, xp=1000, streak=10))
    
    db_session.commit()
    
    lb = get_leaderboard(db_session, u3.id)
    entries = lb["entries"]
    
    # Verify strict descending XP order
    assert all(entries[i]["xp"] >= entries[i+1]["xp"] for i in range(len(entries)-1))
    
    # Extract the 3 tie users
    tie_users = [e for e in entries if e["username"] in ["tie1", "tie2", "tie3"]]
    assert tie_users[0]["username"] == "tie2" # Higher streak (20 > 10)
    assert tie_users[1]["username"] == "tie1" # Equal streak (10), tie1 id < tie3 id
    assert tie_users[2]["username"] == "tie3"
    
    assert lb["current_user_rank"] == tie_users[2]["rank"]

def test_current_user_outside_top_3(db_session: Session):
    # Sofia is at 2150 XP, Alex at 1250, Maya at 980, tie2 at 1000, tie1 at 1000, tie3 at 1000.
    # Demo learner has 0 XP initially. Rank should be low.
    lb = get_leaderboard(db_session, 1) # User 1 (Demo)
    assert lb["current_user_rank"] > 3
    assert lb["entries"][-1]["user_id"] == 1 # Demo has 0 XP

def test_daily_xp_quest_and_date_boundary(db_session: Session):
    now = datetime.now(timezone.utc)
    u = User(username="q_user_1", email="q1@x")
    db_session.add(u)
    db_session.commit()
    db_session.add(UserStats(user_id=u.id, xp=0, daily_xp_goal=20))
    db_session.commit()
    
    # Process lesson completion for a random lesson (lesson 1 and 2)
    process_lesson_completion(db_session, u.id, 1, 100, current_time=now)
    process_lesson_completion(db_session, u.id, 2, 80, current_time=now)
    
    quests = get_daily_quests(db_session, u.id, current_time=now)
    xp_quest = next(q for q in quests if q["id"] == "daily-xp")
    assert xp_quest["progress"] == 25 # 15 + 10 XP
    
    # Date boundary: fast forward 1 day
    tomorrow = now + timedelta(days=1)
    quests_tmrw = get_daily_quests(db_session, u.id, current_time=tomorrow)
    xp_quest_tmrw = next(q for q in quests_tmrw if q["id"] == "daily-xp")
    assert xp_quest_tmrw["progress"] == 0 # Reset!

def test_daily_lesson_quest(db_session: Session):
    now = datetime.now(timezone.utc)
    u = User(username="q_user_2", email="q2@x")
    db_session.add(u)
    db_session.commit()
    db_session.add(UserStats(user_id=u.id, xp=0))
    db_session.commit()
    
    process_lesson_completion(db_session, u.id, 1, 100, current_time=now)
    process_lesson_completion(db_session, u.id, 2, 100, current_time=now)
    
    quests = get_daily_quests(db_session, u.id, current_time=now)
    lesson_quest = next(q for q in quests if q["id"] == "daily-lessons")
    assert lesson_quest["progress"] == 2
    
    tomorrow = now + timedelta(days=1)
    quests_tmrw = get_daily_quests(db_session, u.id, current_time=tomorrow)
    lesson_quest_tmrw = next(q for q in quests_tmrw if q["id"] == "daily-lessons")
    assert lesson_quest_tmrw["progress"] == 0
    
def test_profile_calculations(db_session: Session):
    u = User(username="p_user_1", email="p1@x")
    db_session.add(u)
    db_session.commit()
    db_session.add(UserStats(user_id=u.id, xp=0))
    db_session.commit()
    
    # User has no progress initially
    profile = get_user_profile(db_session, u.id)
    assert profile["progress"]["lessons_completed"] == 0
    assert profile["progress"]["skills_completed"] == 0
    assert profile["stats"]["xp"] == 0
    
    # Complete 1 lesson
    process_lesson_completion(db_session, u.id, 1, 100)
    profile_after = get_user_profile(db_session, u.id)
    assert profile_after["progress"]["lessons_completed"] == 1
    assert profile_after["stats"]["xp"] == 15
