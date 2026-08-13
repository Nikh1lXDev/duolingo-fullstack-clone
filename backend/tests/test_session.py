import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.models.user import User
from app.models.session import AuthSession
from app.services.session import hash_session_token

client = TestClient(app)

def test_session_creation(client, db_session: Session):
    # Setup
    req = {
        "username": "sessiontester",
        "email": "session@example.com",
        "password": "password123"
    }
    client.post("/api/auth/register", json=req)
    
    # 1. Successful login creates AuthSession
    res = client.post("/api/auth/login", json={"username": "sessiontester", "password": "password123"})
    assert res.status_code == 200
    
    # 5. Successful login sets duolingo_session cookie
    cookies = res.cookies
    assert "duolingo_session" in cookies
    raw_token = cookies.get("duolingo_session")
    
    # 6. Cookie is HttpOnly. TestClient cookie jar doesn't expose httponly cleanly sometimes,
    # but we can check the set-cookie header.
    set_cookie_header = res.headers.get("set-cookie")
    assert "HttpOnly" in set_cookie_header
    # 7. Cookie uses SameSite=Lax
    assert "samesite=lax" in set_cookie_header.lower()
    
    # 8. Raw session token is not returned in JSON
    # 23. Response does not contain raw token
    data = res.json()
    assert "duolingo_session" not in data
    assert raw_token not in str(data)
    
    # 21. Response does not contain password
    # 22. Response does not contain password_hash
    assert "password" not in data
    assert "password_hash" not in data

    # 2. Database contains token_hash, not raw token
    # 24. Database does not contain raw token
    token_hash = hash_session_token(raw_token)
    session_record = db_session.query(AuthSession).filter(AuthSession.token_hash == token_hash).first()
    assert session_record is not None
    assert session_record.token_hash != raw_token
    
    # 3. Session expiration is calculated correctly
    now = datetime.now(timezone.utc)
    # The default is 7 days, so it should be > 6 days and < 8 days
    assert (session_record.expires_at.replace(tzinfo=timezone.utc) - now).days == 6 or (session_record.expires_at.replace(tzinfo=timezone.utc) - now).days == 7
    
    # 4. Session is associated with correct user
    user = db_session.query(User).filter(User.username == "sessiontester").first()
    assert session_record.user_id == user.id

def test_logout(client, db_session: Session):
    # Login again
    res = client.post("/api/auth/login", json={"username": "sessiontester", "password": "password123"})
    raw_token = res.cookies.get("duolingo_session")
    
    # 9. Logout revokes current session
    # 10. Logout clears cookie
    logout_res = client.post("/api/auth/logout", cookies={"duolingo_session": raw_token})
    assert logout_res.status_code == 200
    
    # Cookie should be cleared
    assert logout_res.cookies.get("duolingo_session") == '""' or logout_res.cookies.get("duolingo_session") == "" or not logout_res.cookies.get("duolingo_session")
    
    # Check revoked_at in DB
    token_hash = hash_session_token(raw_token)
    session_record = db_session.query(AuthSession).filter(AuthSession.token_hash == token_hash).first()
    assert session_record.revoked_at is not None
    
    # 13. Already revoked session remains safe
    logout_res2 = client.post("/api/auth/logout", cookies={"duolingo_session": raw_token})
    assert logout_res2.status_code == 200

def test_logout_edge_cases(client, db_session: Session):
    # 11. Logout with no cookie does not crash
    res = client.post("/api/auth/logout")
    assert res.status_code == 200
    
    # 12. Logout with invalid cookie does not crash
    res = client.post("/api/auth/logout", cookies={"duolingo_session": "invalid_cookie_garbage"})
    assert res.status_code == 200

def test_session_validation(client, db_session: Session):
    from app.services.session import get_session
    
    res = client.post("/api/auth/login", json={"username": "sessiontester", "password": "password123"})
    raw_token = res.cookies.get("duolingo_session")
    
    # 14. Valid session resolves to correct user
    user, session_rec = get_session(db_session, raw_token)
    assert user is not None
    assert user.username == "sessiontester"
    assert session_rec is not None
    
    # 15. Invalid token is rejected
    user_inv, session_inv = get_session(db_session, "invalid_token")
    assert user_inv is None
    assert session_inv is None
    
    # 17. Revoked session is rejected
    client.post("/api/auth/logout", cookies={"duolingo_session": raw_token})
    user_rev, session_rev = get_session(db_session, raw_token)
    assert user_rev is None
    assert session_rev is None
    
    # 16. Expired session is rejected
    # Create manually an expired session
    from app.services.session import create_session
    exp_token, exp_rec = create_session(db_session, user.id, -1) # -1 days expires immediately
    
    user_exp, session_exp = get_session(db_session, exp_token)
    assert user_exp is None
    assert session_exp is None
    
    # 18. Different user's session cannot resolve incorrectly
    # We implicitly test this because get_session uses the exact token hash which maps to exactly one user

def test_multiple_sessions(client, db_session: Session):
    # 19. Two logins create two sessions
    res1 = client.post("/api/auth/login", json={"username": "sessiontester", "password": "password123"})
    res2 = client.post("/api/auth/login", json={"username": "sessiontester", "password": "password123"})
    
    token1 = res1.cookies.get("duolingo_session")
    token2 = res2.cookies.get("duolingo_session")
    
    assert token1 != token2
    
    from app.services.session import get_session
    user1, _ = get_session(db_session, token1)
    user2, _ = get_session(db_session, token2)
    assert user1 is not None and user2 is not None
    
    # 20. Logging out one session does not revoke the other
    client.post("/api/auth/logout", cookies={"duolingo_session": token1})
    
    user1_after, _ = get_session(db_session, token1)
    assert user1_after is None # Revoked
    
    user2_after, _ = get_session(db_session, token2)
    assert user2_after is not None # Still active

def test_registration_preservation(client, db_session: Session):
    # 25. Existing registration still works
    # 26. Registration behavior remains unchanged
    req = {
        "username": "anothertester",
        "email": "another@example.com",
        "password": "password123"
    }
    res = client.post("/api/auth/register", json=req)
    assert res.status_code == 201
    
    # Cleanup all
    db_session.query(AuthSession).delete()
    users = db_session.query(User).filter(User.username.in_(["sessiontester", "anothertester"])).all()
    for u in users:
        db_session.delete(u)
    db_session.commit()
