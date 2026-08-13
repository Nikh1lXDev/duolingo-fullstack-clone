import pytest
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.user import User, UserStats
from app.services.session import create_session

def get_token_for_user(db_session: Session, user_id: int):
    token, _ = create_session(db_session, user_id, 7)
    return {"duolingo_session": token}

def test_shop_successful_refill(client, db_session: Session):
    u = User(username="shop_1", email="s1@x")
    db_session.add(u)
    db_session.commit()
    db_session.add(UserStats(user_id=u.id, xp=0, gems=600, hearts=2))
    db_session.commit()

    res = client.post("/api/users/me/hearts/refill", cookies=get_token_for_user(db_session, u.id))
    assert res.status_code == 200
    data = res.json()
    assert data["gems"] == 100
    assert data["hearts"] == 5

def test_shop_exactly_500_gems(client, db_session: Session):
    u = User(username="shop_2", email="s2@x")
    db_session.add(u)
    db_session.commit()
    db_session.add(UserStats(user_id=u.id, xp=0, gems=500, hearts=1))
    db_session.commit()

    res = client.post("/api/users/me/hearts/refill", cookies=get_token_for_user(db_session, u.id))
    assert res.status_code == 200
    assert res.json()["gems"] == 0
    assert res.json()["hearts"] == 5

def test_shop_insufficient_gems(client, db_session: Session):
    u = User(username="shop_3", email="s3@x")
    db_session.add(u)
    db_session.commit()
    db_session.add(UserStats(user_id=u.id, xp=0, gems=499, hearts=1))
    db_session.commit()

    res = client.post("/api/users/me/hearts/refill", cookies=get_token_for_user(db_session, u.id))
    assert res.status_code == 400
    assert "Insufficient gems" in res.json()["detail"]
    
    # Verify no deduction occurred
    stats = db_session.query(UserStats).filter_by(user_id=u.id).first()
    assert stats.gems == 499
    assert stats.hearts == 1

def test_shop_hearts_already_at_5(client, db_session: Session):
    u = User(username="shop_4", email="s4@x")
    db_session.add(u)
    db_session.commit()
    db_session.add(UserStats(user_id=u.id, xp=0, gems=1000, hearts=5))
    db_session.commit()

    res = client.post("/api/users/me/hearts/refill", cookies=get_token_for_user(db_session, u.id))
    assert res.status_code == 200
    data = res.json()
    
    # Idempotent return without deduction
    assert data["gems"] == 1000
    assert data["hearts"] == 5

def test_shop_duplicate_retry_protection(client, db_session: Session):
    u = User(username="shop_5", email="s5@x")
    db_session.add(u)
    db_session.commit()
    db_session.add(UserStats(user_id=u.id, xp=0, gems=1000, hearts=2))
    db_session.commit()

    # First request
    res1 = client.post("/api/users/me/hearts/refill", cookies=get_token_for_user(db_session, u.id))
    assert res1.status_code == 200
    assert res1.json()["gems"] == 500
    
    # Immediate duplicate request
    res2 = client.post("/api/users/me/hearts/refill", cookies=get_token_for_user(db_session, u.id))
    assert res2.status_code == 200
    assert res2.json()["gems"] == 500 # Unchanged
    assert res2.json()["hearts"] == 5

def test_settings_get_defaults(client, db_session: Session):
    u = User(username="set_1", email="set1@x")
    db_session.add(u)
    db_session.commit()

    res = client.get("/api/users/me/settings", cookies=get_token_for_user(db_session, u.id))
    assert res.status_code == 200
    data = res.json()
    assert data["sound_enabled"] is True
    assert data["notifications_enabled"] is True
    assert data["course_language"] == "es"

def test_settings_update_sound(client, db_session: Session):
    u = User(username="set_2", email="set2@x")
    db_session.add(u)
    db_session.commit()

    res = client.put("/api/users/me/settings", json={
        "sound_enabled": False,
        "notifications_enabled": True,
        "course_language": "es"
    }, cookies=get_token_for_user(db_session, u.id))
    assert res.status_code == 200
    assert res.json()["sound_enabled"] is False

def test_settings_update_language_and_notifications(client, db_session: Session):
    u = User(username="set_3", email="set3@x")
    db_session.add(u)
    db_session.commit()

    res = client.put("/api/users/me/settings", json={
        "sound_enabled": False,
        "notifications_enabled": False,
        "course_language": "fr"
    }, cookies=get_token_for_user(db_session, u.id))
    assert res.status_code == 200
    data = res.json()
    assert data["notifications_enabled"] is False
    assert data["course_language"] == "fr"
