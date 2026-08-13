import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.models.course import Course
from app.models.user import User, UserSettings
from app.services.exercise_generator import generate_exercises_for_lesson

def test_get_courses_returns_all_available_courses(db_session):
    client = TestClient(app)
    res = client.get("/api/courses")
    assert res.status_code == 200
    courses = res.json()
    assert isinstance(courses, list)
    assert len(courses) >= 7

    # Check language fields
    for c in courses:
        assert "source_language" in c
        assert "target_language" in c
        assert c["source_language"] is not None

def test_user_course_selection_persistence_and_isolation():
    client_a = TestClient(app)
    client_b = TestClient(app)

    u_a = f"c_user_a_{uuid.uuid4().hex[:6]}"
    u_b = f"c_user_b_{uuid.uuid4().hex[:6]}"

    # Register User A and User B
    reg_a = client_a.post("/api/auth/register", json={"username": u_a, "email": f"{u_a}@example.com", "password": "password123"})
    assert reg_a.status_code in (200, 201)
    reg_b = client_b.post("/api/auth/register", json={"username": u_b, "email": f"{u_b}@example.com", "password": "password123"})
    assert reg_b.status_code in (200, 201)

    # Fetch courses
    courses = client_a.get("/api/courses").json()
    hindi_course = next(c for c in courses if c["source_language"] == "Hindi")
    french_course = next(c for c in courses if c["source_language"] == "French")

    # User A selects Hindi
    res_a = client_a.put("/api/users/me/settings", json={"sound_enabled": True, "notifications_enabled": True, "course_language": "en", "course_id": hindi_course["id"]})
    assert res_a.status_code == 200
    assert res_a.json()["course_id"] == hindi_course["id"]

    # User B selects French
    res_b = client_b.put("/api/users/me/settings", json={"sound_enabled": True, "notifications_enabled": True, "course_language": "en", "course_id": french_course["id"]})
    assert res_b.status_code == 200
    assert res_b.json()["course_id"] == french_course["id"]

    # Verify User A's setting remains Hindi
    settings_a = client_a.get("/api/users/me/settings").json()
    assert settings_a["course_id"] == hindi_course["id"]

    # Verify User B's setting remains French
    settings_b = client_b.get("/api/users/me/settings").json()
    assert settings_b["course_id"] == french_course["id"]

def test_invalid_course_id_rejected():
    client = TestClient(app)
    u_name = f"inv_user_{uuid.uuid4().hex[:6]}"
    reg = client.post("/api/auth/register", json={"username": u_name, "email": f"{u_name}@example.com", "password": "password123"})
    assert reg.status_code in (200, 201)

    res = client.put("/api/users/me/settings", json={"sound_enabled": True, "notifications_enabled": True, "course_language": "en", "course_id": 999999})
    assert res.status_code == 400

def test_learning_path_resolves_user_selected_course():
    client = TestClient(app)
    u_name = f"lp_user_{uuid.uuid4().hex[:6]}"
    reg = client.post("/api/auth/register", json={"username": u_name, "email": f"{u_name}@example.com", "password": "password123"})
    assert reg.status_code in (200, 201)

    courses = client.get("/api/courses").json()
    german_course = next(c for c in courses if c["source_language"] == "German")

    client.put("/api/users/me/settings", json={"sound_enabled": True, "notifications_enabled": True, "course_language": "en", "course_id": german_course["id"]})

    res = client.get("/api/users/me/learning-path")
    assert res.status_code == 200
    data = res.json()
    assert data["course"]["id"] == german_course["id"]
    assert data["course"]["source_language"] == "German"

def test_lesson_generation_uses_selected_course_language(db_session):
    courses = db_session.query(Course).all()
    spanish_c = next(c for c in courses if c.source_language == "Spanish")
    hindi_c = next(c for c in courses if c.source_language == "Hindi")
    french_c = next(c for c in courses if c.source_language == "French")
    german_c = next(c for c in courses if c.source_language == "German")

    # Fetch lessons for each course
    sp_skill = spanish_c.units[0].skills[0]
    hi_skill = hindi_c.units[0].skills[0]
    fr_skill = french_c.units[0].skills[0]
    de_skill = german_c.units[0].skills[0]

    sp_exs = generate_exercises_for_lesson(db_session, sp_skill.lessons[0], seed=42)
    hi_exs = generate_exercises_for_lesson(db_session, hi_skill.lessons[0], seed=42)
    fr_exs = generate_exercises_for_lesson(db_session, fr_skill.lessons[0], seed=42)
    de_exs = generate_exercises_for_lesson(db_session, de_skill.lessons[0], seed=42)

    # Spanish vocabulary check
    assert any("manzana" in e.prompt or "manzana" in (e.options or "") or e.correct_answer == "manzana" for e in sp_exs)

    # Hindi vocabulary check
    assert any("नमस्ते" in e.prompt or "नमस्ते" in (e.options or "") or e.correct_answer == "नमस्ते" for e in hi_exs)

    # French vocabulary check
    assert any("bonjour" in e.prompt or "bonjour" in (e.options or "") or e.correct_answer == "bonjour" for e in fr_exs)

    # German vocabulary check
    assert any("hallo" in e.prompt or "hallo" in (e.options or "") or e.correct_answer == "hallo" for e in de_exs)

def test_demo_learner_intact(db_session):
    demo_user = db_session.query(User).filter(User.username == "demo_learner").first()
    assert demo_user is not None
    assert demo_user.stats.hearts == 5
