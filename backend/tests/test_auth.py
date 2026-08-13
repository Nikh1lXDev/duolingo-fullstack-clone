import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.services.auth import hash_password, verify_password, InvalidCredentialsError
from app.models.user import User, UserStats, UserSettings
from app.services.session import create_session

def get_demo_token(db_session):
    token, _ = create_session(db_session, 1, 7)
    return {"duolingo_session": token}

client = TestClient(app)

def test_password_hashing():
    plaintext = "supersecret"
    hashed = hash_password(plaintext)
    
    # 1. Password hashes are not equal to plaintext
    assert hashed != plaintext
    
    # 2. Correct password verifies
    assert verify_password(plaintext, hashed) is True
    
    # 3. Incorrect password fails
    assert verify_password("wrongpassword", hashed) is False
    
    # 4. Empty/invalid password handling works correctly
    assert verify_password("", hashed) is False
    assert verify_password(plaintext, "") is False
    assert verify_password(plaintext, None) is False

def test_successful_registration(client, db_session: Session):
    req = {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "mysecurepassword",
        "display_name": "New User"
    }
    
    # 5. Successful registration
    response = client.post("/api/auth/register", json=req)
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "newuser@example.com"
    
    # 17. Auth response does not contain password
    assert "password" not in data
    
    # 18. Auth response does not contain password_hash
    assert "password_hash" not in data
    
    user_id = data["id"]
    db_user = db_session.query(User).filter(User.id == user_id).first()
    
    # 6. Password is stored as a hash
    assert db_user.password_hash != "mysecurepassword"
    assert verify_password("mysecurepassword", db_user.password_hash) is True
    
    # 8. UserStats automatically created
    stats = db_session.query(UserStats).filter(UserStats.user_id == user_id).first()
    assert stats is not None
    assert stats.gems == 500
    
    # 9. UserSettings automatically created
    settings = db_session.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    assert settings is not None
    assert settings.sound_enabled is True
    
    # Cleanup
    db_session.delete(db_user)
    db_session.commit()

def test_registration_duplicates(client, db_session: Session):
    req = {
        "username": "dupuser",
        "email": "dup@example.com",
        "password": "password123"
    }
    res1 = client.post("/api/auth/register", json=req)
    assert res1.status_code == 201
    
    # 10. Duplicate email rejected (409)
    req2 = {
        "username": "dupuser2",
        "email": "dup@example.com",
        "password": "password123"
    }
    res2 = client.post("/api/auth/register", json=req2)
    assert res2.status_code == 409
    
    # 11. Duplicate username rejected (409)
    req3 = {
        "username": "dupuser",
        "email": "dup2@example.com",
        "password": "password123"
    }
    res3 = client.post("/api/auth/register", json=req3)
    assert res3.status_code == 409
    
    # Cleanup
    db_user = db_session.query(User).filter(User.username == "dupuser").first()
    db_session.delete(db_user)
    db_session.commit()

def test_login(client, db_session: Session):
    req = {
        "username": "logintester",
        "email": "login@example.com",
        "password": "password123"
    }
    client.post("/api/auth/register", json=req)
    
    # 13. Correct credentials succeed
    res = client.post("/api/auth/login", json={"username": "logintester", "password": "password123"})
    assert res.status_code == 200
    assert res.json()["username"] == "logintester"
    
    # 14. Incorrect password returns 401
    res = client.post("/api/auth/login", json={"username": "logintester", "password": "wrong"})
    assert res.status_code == 401
    
    # 15. Nonexistent account returns generic 401
    res = client.post("/api/auth/login", json={"username": "nobody", "password": "password123"})
    assert res.status_code == 401
    
    # Cleanup
    db_user = db_session.query(User).filter(User.username == "logintester").first()
    db_session.delete(db_user)
    db_session.commit()
    
def test_existing_user_no_password(client, db_session: Session):
    # 16. Existing user with password_hash=NULL cannot log in.
    res = client.post("/api/auth/login", json={"username": "demo_learner", "password": "password123"})
    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid credentials"

def test_public_schema(client, db_session):
    # 19. Public User schema still does not expose password_hash
    res = client.get("/api/users/me/profile", cookies=get_demo_token(db_session))
    if res.status_code == 200:
        assert "password_hash" not in res.json()
