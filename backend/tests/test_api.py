from app.models.user import User, UserStats
from app.models.course import Course
from app.models.unit import Unit
from app.models.skill import Skill
from app.models.lesson import Lesson
from app.models.exercise import Exercise
from app.models.progress import UserSkillProgress, UserLessonProgress
import pytest
from sqlalchemy.exc import IntegrityError
from app.services.session import create_session

def get_demo_token(db_session):
    token, _ = create_session(db_session, 1, 7)
    return {"duolingo_session": token}

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_get_courses(client):
    response = client.get("/api/courses/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "English for Beginners"

def test_get_course(client):
    response = client.get("/api/courses/1")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "English for Beginners"
    assert "units" in data
    assert len(data["units"]) >= 3

def test_get_unit(client):
    response = client.get("/api/units/1")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Unit 1"
    assert "skills" in data
    assert len(data["skills"]) >= 2

def test_get_skill(client):
    response = client.get("/api/skills/1")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Basics"
    assert "lessons" in data
    assert len(data["lessons"]) >= 2

def test_get_lesson(client):
    response = client.get("/api/lessons/1")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Lesson 1"
    assert "exercises" in data
    assert len(data["exercises"]) >= 5

def test_get_user(client, db_session):
    response = client.get("/api/users/me/profile", cookies=get_demo_token(db_session))
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["username"] == "demo_learner"
    assert "stats" in data
    assert data["stats"]["xp"] >= 0

def test_get_user_progress(client, db_session):
    response = client.get("/api/users/me/progress", cookies=get_demo_token(db_session))
    assert response.status_code == 200
    data = response.json()
    assert "skill_progress" in data
    assert "lesson_progress" in data
    assert len(data["skill_progress"]) >= 1

def test_get_user_learning_path(client, db_session):
    response = client.get("/api/users/me/learning-path", cookies=get_demo_token(db_session))
    assert response.status_code == 200
    data = response.json()
    assert "course" in data
    assert "units" in data
    
    # Check progression logic guarantees
    # We seeded 1 completed, 1 in-progress, 1 unlocked (but 0 progress), rest locked.
    locked_count = 0
    unlocked_count = 0
    
    for unit in data["units"]:
        for skill in unit["skills"]:
            if skill["locked"]:
                locked_count += 1
            else:
                unlocked_count += 1
                
    assert unlocked_count >= 1
    assert locked_count >= 1


def test_404_responses(client):
    assert client.get("/api/courses/999").status_code == 404
    assert client.get("/api/units/999").status_code == 404
    assert client.get("/api/skills/999").status_code == 404
    assert client.get("/api/lessons/999").status_code == 404
    assert client.get("/api/users/999").status_code == 404

def test_seed_data_counts(db_session):
    assert db_session.query(User).count() >= 1
    assert db_session.query(Course).count() >= 1
    assert db_session.query(Unit).count() >= 3
    assert db_session.query(Skill).count() >= 6
    assert db_session.query(Lesson).count() >= 12
    assert db_session.query(Exercise).count() >= 60

def test_progress_uniqueness_constraint(db_session):
    # Try inserting a duplicate skill progress
    with pytest.raises(IntegrityError):
        duplicate_progress = UserSkillProgress(user_id=1, skill_id=1, progress=0)
        db_session.add(duplicate_progress)
        db_session.commit()
    db_session.rollback()

def test_get_next_lesson(client, db_session):
    # Skill 1 is fully completed, so it should return the first lesson (id 1)
    response = client.get("/api/users/me/skills/1/next-lesson", cookies=get_demo_token(db_session))
    assert response.status_code == 200
    assert response.json()["id"] == 1
    
    # Skill 2 has lesson 3 completed, so lesson 4 should be returned
    response = client.get("/api/users/me/skills/2/next-lesson", cookies=get_demo_token(db_session))
    assert response.status_code == 200
    assert response.json()["id"] == 4

def test_update_lesson_progress_idempotency(client, db_session):
    # Complete lesson 4
    response = client.post("/api/users/me/lessons/4/progress", json={"completed": True, "score": 100}, cookies=get_demo_token(db_session))
    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True
    assert data["attempts"] == 1
    
    # Second submission (e.g. repeated click) should be idempotent
    response = client.post("/api/users/me/lessons/4/progress", json={"completed": True, "score": 100}, cookies=get_demo_token(db_session))
    assert response.status_code == 200
    data2 = response.json()
    assert data2["attempts"] == 1  # Should NOT increment again
