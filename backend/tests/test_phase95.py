import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.models.user import User, UserStats, UserSettings
from app.models.session import AuthSession
from app.services.session import hash_session_token

client = TestClient(app)

def setup_users(client, db_session):
    client.post("/api/auth/register", json={"username": "userA", "email": "userA@example.com", "password": "passwordA", "display_name": "User A"})
    client.post("/api/auth/register", json={"username": "userB", "email": "userB@example.com", "password": "passwordB", "display_name": "User B"})

def cleanup_users(db_session):
    db_session.query(AuthSession).delete()
    users = db_session.query(User).filter(User.username.in_(["userA", "userB"])).all()
    for u in users:
        db_session.delete(u)
    db_session.commit()

def test_unauthenticated_access(client):
    endpoints = [
        ("GET", "/api/users/me/profile"),
        ("GET", "/api/users/me/quests"),
        ("GET", "/api/users/me/settings"),
        ("GET", "/api/users/me/learning-path"),
        ("GET", "/api/users/me/progress"),
        ("POST", "/api/users/me/hearts/deduct"),
        ("POST", "/api/users/me/hearts/refill"),
    ]
    for method, url in endpoints:
        if method == "GET":
            res = client.get(url)
        else:
            res = client.post(url, json={"deduction_id": "test_123"} if "deduct" in url else {})
        assert res.status_code == 401

def test_multi_user_get(client, db_session: Session):
    setup_users(client, db_session)
    try:
        res_a = client.post("/api/auth/login", json={"username": "userA", "password": "passwordA"})
        res_b = client.post("/api/auth/login", json={"username": "userB", "password": "passwordB"})
        token_a = res_a.cookies.get("duolingo_session")
        token_b = res_b.cookies.get("duolingo_session")
        
        # Profile
        res_prof = client.get("/api/users/me/profile", cookies={"duolingo_session": token_a})
        print(res_prof.json())
        assert res_prof.json()["user"]["username"] == "userA"
        res_prof_b = client.get("/api/users/me/profile", cookies={"duolingo_session": token_b})
        assert res_prof_b.json()["user"]["username"] == "userB"
        
        # Quests (just checking it succeeds and isolating logic inherently uses current_user.id)
        assert client.get("/api/users/me/quests", cookies={"duolingo_session": token_a}).status_code == 200
        assert client.get("/api/users/me/quests", cookies={"duolingo_session": token_b}).status_code == 200
        
        # Settings
        set_a = client.get("/api/users/me/settings", cookies={"duolingo_session": token_a})
        set_b = client.get("/api/users/me/settings", cookies={"duolingo_session": token_b})
        assert set_a.status_code == 200
        assert set_b.status_code == 200
        
        # Learning Path
        assert client.get("/api/users/me/learning-path", cookies={"duolingo_session": token_a}).status_code == 200
        assert client.get("/api/users/me/learning-path", cookies={"duolingo_session": token_b}).status_code == 200
        
        # Progress
        assert client.get("/api/users/me/progress", cookies={"duolingo_session": token_a}).status_code == 200
        assert client.get("/api/users/me/progress", cookies={"duolingo_session": token_b}).status_code == 200
    finally:
        cleanup_users(db_session)

def test_mutation_isolation(client, db_session: Session):
    setup_users(client, db_session)
    try:
        res_a = client.post("/api/auth/login", json={"username": "userA", "password": "passwordA"})
        res_b = client.post("/api/auth/login", json={"username": "userB", "password": "passwordB"})
        token_a = res_a.cookies.get("duolingo_session")
        token_b = res_b.cookies.get("duolingo_session")
        
        # 18. A settings mutation cannot affect B
        put_payload = {"sound_enabled": False, "notifications_enabled": True, "course_language": "es"}
        put_res = client.put("/api/users/me/settings", json=put_payload, cookies={"duolingo_session": token_a})
        assert put_res.status_code == 200
        set_a = client.get("/api/users/me/settings", cookies={"duolingo_session": token_a}).json()
        set_b = client.get("/api/users/me/settings", cookies={"duolingo_session": token_b}).json()
        print("Settings response:", set_a)
        assert set_a["sound_enabled"] is False
        assert set_b["sound_enabled"] is True
        
        # 19. A heart deduction cannot affect B
        client.post("/api/users/me/hearts/deduct", json={"deduction_id": "deduct_A_1"}, cookies={"duolingo_session": token_a})
        stat_a = client.get("/api/users/me/profile", cookies={"duolingo_session": token_a}).json()["stats"]
        stat_b = client.get("/api/users/me/profile", cookies={"duolingo_session": token_b}).json()["stats"]
        assert stat_a["hearts"] == 4
        assert stat_b["hearts"] == 5
        
        # 20. A refill cannot affect B
        # Let's refill A (costs gems)
        client.post("/api/users/me/hearts/refill", cookies={"duolingo_session": token_a})
        stat_a2 = client.get("/api/users/me/profile", cookies={"duolingo_session": token_a}).json()["stats"]
        stat_b2 = client.get("/api/users/me/profile", cookies={"duolingo_session": token_b}).json()["stats"]
        assert stat_a2["hearts"] == 5
        assert stat_a2["gems"] == 0 # 500 - 500
        assert stat_b2["gems"] == 500
        
        # 21. A lesson completion cannot affect B
        # Get first lesson to complete
        lp = client.get("/api/users/me/learning-path", cookies={"duolingo_session": token_a}).json()
        first_skill_id = lp["units"][0]["skills"][0]["id"]
        next_lesson = client.get(f"/api/users/me/skills/{first_skill_id}/next-lesson", cookies={"duolingo_session": token_a}).json()
        lesson_id = next_lesson["id"]
        
        res_prog = client.post(f"/api/users/me/lessons/{lesson_id}/progress", json={"score": 1.0, "time_spent_seconds": 60, "completed": True}, cookies={"duolingo_session": token_a})
        print("Lesson progress response:", res_prog.status_code, res_prog.json())
        
        prog_a = client.get("/api/users/me/progress", cookies={"duolingo_session": token_a}).json()
        prog_b = client.get("/api/users/me/progress", cookies={"duolingo_session": token_b}).json()
        assert len(prog_a["lesson_progress"]) > 0
        assert len(prog_b["lesson_progress"]) == 0
        
        # 22. XP awarded correctly
        # 23. Streak remains correct
        # 24. Daily XP remains correct
        stat_a3 = client.get("/api/users/me/profile", cookies={"duolingo_session": token_a}).json()["stats"]
        assert stat_a3["xp"] > 0
        assert stat_a3["streak"] == 1
        assert stat_a3["daily_xp_progress"] > 0
        
        # 25. Duplicate completion remains idempotent
        res_dup = client.post(f"/api/users/me/lessons/{lesson_id}/progress", json={"score": 1.0, "time_spent_seconds": 60, "completed": True}, cookies={"duolingo_session": token_a})
        assert res_dup.status_code == 200
        stat_a4 = client.get("/api/users/me/profile", cookies={"duolingo_session": token_a}).json()["stats"]
        assert stat_a3["xp"] == stat_a4["xp"] # no double XP awarded
        
    finally:
        cleanup_users(db_session)
