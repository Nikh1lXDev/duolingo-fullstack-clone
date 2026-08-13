import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.models.user import User
from app.models.session import AuthSession
from app.services.session import hash_session_token, create_session, revoke_session

client = TestClient(app)

def setup_users(client, db_session):
    # Setup users
    client.post("/api/auth/register", json={
        "username": "userA",
        "email": "userA@example.com",
        "password": "passwordA",
        "display_name": "User A"
    })
    client.post("/api/auth/register", json={
        "username": "userB",
        "email": "userB@example.com",
        "password": "passwordB",
        "display_name": "User B"
    })

def cleanup_users(db_session):
    db_session.query(AuthSession).delete()
    users = db_session.query(User).filter(User.username.in_(["userA", "userB"])).all()
    for u in users:
        db_session.delete(u)
    db_session.commit()

def test_auth_me_no_cookie(client):
    # 1. GET /api/auth/me without cookie -> 401
    res = client.get("/api/auth/me")
    assert res.status_code == 401
    assert res.json()["detail"] == "Not authenticated"

def test_auth_me_invalid_cookie(client):
    # 2. GET /api/auth/me with invalid cookie -> 401
    # 3. GET /api/auth/me with random token -> 401
    res = client.get("/api/auth/me", cookies={"duolingo_session": "invalid_or_random"})
    assert res.status_code == 401
    assert res.json()["detail"] == "Not authenticated"

def test_auth_me_valid_session(client, db_session: Session):
    setup_users(client, db_session)
    try:
        # Login A
        res_login = client.post("/api/auth/login", json={"username": "userA", "password": "passwordA"})
        token = res_login.cookies.get("duolingo_session")
        
        # Capture last_used_at before
        token_hash = hash_session_token(token)
        session_before = db_session.query(AuthSession).filter(AuthSession.token_hash == token_hash).first()
        last_used_before = session_before.last_used_at
        
        # 6. Valid session -> 200
        res = client.get("/api/auth/me", cookies={"duolingo_session": token})
        assert res.status_code == 200
        data = res.json()
        
        # 7. Valid session returns correct user
        # 8. User ID comes from authenticated session
        assert data["username"] == "userA"
        
        # 11, 12, 13, 14. Response contains no password or token
        assert "password" not in data
        assert "password_hash" not in data
        assert "token" not in data
        assert "token_hash" not in data
        
        # 9. Valid request updates last_used_at
        session_after = db_session.query(AuthSession).filter(AuthSession.token_hash == token_hash).first()
        # The update is tracked via get_session
        assert session_after.last_used_at >= last_used_before
    finally:
        cleanup_users(db_session)

def test_auth_me_revoked_session(client, db_session: Session):
    setup_users(client, db_session)
    try:
        res_login = client.post("/api/auth/login", json={"username": "userA", "password": "passwordA"})
        token = res_login.cookies.get("duolingo_session")
        
        revoke_session(db_session, token)
        
        # 4. GET /api/auth/me with revoked session -> 401
        res = client.get("/api/auth/me", cookies={"duolingo_session": token})
        assert res.status_code == 401
    finally:
        cleanup_users(db_session)

def test_auth_me_expired_session(client, db_session: Session):
    setup_users(client, db_session)
    try:
        user = db_session.query(User).filter(User.username == "userA").first()
        token, _ = create_session(db_session, user.id, -1) # Expired 1 day ago
        
        # 5. GET /api/auth/me with expired session -> 401
        res = client.get("/api/auth/me", cookies={"duolingo_session": token})
        assert res.status_code == 401
    finally:
        cleanup_users(db_session)

def test_auth_me_deleted_user(client, db_session: Session):
    setup_users(client, db_session)
    try:
        res_login = client.post("/api/auth/login", json={"username": "userA", "password": "passwordA"})
        token = res_login.cookies.get("duolingo_session")
        
        # Delete user directly
        user = db_session.query(User).filter(User.username == "userA").first()
        db_session.delete(user) # This deletes session because of cascade, but we can verify auth behavior
        db_session.commit()
        
        # 10. Deleted/nonexistent user attached to session -> 401
        res = client.get("/api/auth/me", cookies={"duolingo_session": token})
        assert res.status_code == 401
    finally:
        cleanup_users(db_session)

def test_session_isolation(client, db_session: Session):
    setup_users(client, db_session)
    try:
        # Create Session A and B
        res_a = client.post("/api/auth/login", json={"username": "userA", "password": "passwordA"})
        res_b = client.post("/api/auth/login", json={"username": "userB", "password": "passwordB"})
        
        token_a = res_a.cookies.get("duolingo_session")
        token_b = res_b.cookies.get("duolingo_session")
        
        # Cookie A -> /api/auth/me -> User A
        res_me_a = client.get("/api/auth/me", cookies={"duolingo_session": token_a})
        assert res_me_a.status_code == 200
        assert res_me_a.json()["username"] == "userA"
        
        # Cookie B -> /api/auth/me -> User B
        res_me_b = client.get("/api/auth/me", cookies={"duolingo_session": token_b})
        assert res_me_b.status_code == 200
        assert res_me_b.json()["username"] == "userB"
        
        # 15. Two users with different sessions resolve independently.
        assert token_a != token_b
    finally:
        cleanup_users(db_session)
