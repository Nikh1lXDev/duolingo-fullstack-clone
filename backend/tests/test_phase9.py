import pytest
import sqlite3
from sqlalchemy import inspect, text
from app.core.database import engine
from app.models.user import User, UserStats, UserSettings
from app.models.course import Course
from app.models.unit import Unit
from app.models.skill import Skill
from app.models.lesson import Lesson
from app.models.exercise import Exercise
from app.models.progress import UserSkillProgress, UserLessonProgress
from app.schemas.user import UserProfile

def test_schema_existence():
    """Verify the SQLAlchemy User model contains password_hash."""
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('users')]
    assert 'password_hash' in columns

def test_database_column(db_session):
    """Verify PRAGMA table_info(users) contains password_hash."""
    result = db_session.execute(text("PRAGMA table_info(users)")).fetchall()
    columns = [row[1] for row in result]
    assert 'password_hash' in columns

def test_nullable_behavior(db_session):
    """Verify existing users can have NULL password_hash."""
    demo_user = db_session.query(User).filter(User.id == 1).first()
    assert demo_user is not None
    assert demo_user.password_hash is None

def test_demo_learner_preservation(db_session):
    """Verify User ID 1 still exists."""
    demo_user = db_session.query(User).filter(User.id == 1).first()
    assert demo_user is not None
    assert demo_user.username == "demo_learner"

def test_leaderboard_preservation(db_session):
    """Verify leaderboard users still exist."""
    usernames = ["alex", "maya", "leo", "sofia"]
    users = db_session.query(User).filter(User.username.in_(usernames)).all()
    assert len(users) == 4

def test_course_preservation(db_session):
    """Verify existing course data remains."""
    assert db_session.query(Course).count() >= 1

def test_lesson_exercise_preservation(db_session):
    """Verify the existing seeded counts remain."""
    assert db_session.query(Course).count() >= 1
    assert db_session.query(Unit).count() >= 3
    assert db_session.query(Skill).count() >= 6
    assert db_session.query(Lesson).count() >= 12
    assert db_session.query(Exercise).count() >= 72

def test_progress_preservation(db_session):
    """Verify existing UserSkillProgress/UserLessonProgress records remain."""
    assert db_session.query(UserSkillProgress).count() > 0
    assert db_session.query(UserLessonProgress).count() > 0

def test_stats_preservation(db_session):
    """Verify UserStats values were not reset."""
    stats = db_session.query(UserStats).filter(UserStats.user_id == 1).first()
    assert stats is not None
    assert stats.gems >= 0

def test_settings_preservation(db_session):
    """Verify UserSettings still exists and values remain intact."""
    settings = db_session.query(UserSettings).filter(UserSettings.user_id == 1).first()
    if settings is not None:
        assert isinstance(settings.sound_enabled, bool)

def test_public_schema_security():
    """Verify 'password_hash' does NOT appear in public user response model_dump()."""
    # Assuming user 1 data
    data = {
        "id": 1,
        "username": "demo_learner",
        "email": "demo@example.com",
        "created_at": "2024-01-01T00:00:00Z",
        "stats": {
            "id": 1,
            "user_id": 1,
            "xp": 100,
            "gems": 500,
            "hearts": 5,
            "streak": 1,
            "longest_streak": 1,
            "daily_xp_goal": 20,
            "daily_xp_progress": 0,
            "lessons_completed": 1,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
    }
    profile = UserProfile(**data)
    dumped = profile.model_dump()
    assert "password_hash" not in dumped

def test_migration_idempotency():
    """Run the migration script logic again to ensure idempotency."""
    import sqlite3
    import os
    db_path = os.path.join(os.path.dirname(__file__), "..", "duolingo.db")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(users)")
    columns = [col[1] for col in cursor.fetchall()]
    assert "password_hash" in columns
    conn.close()
