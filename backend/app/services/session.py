import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.session import AuthSession
from app.models.user import User

def hash_session_token(token: str) -> str:
    """Hashes the raw token using SHA-256 for secure database lookup."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def create_session(db: Session, user_id: int, expires_in_days: int) -> tuple[str, AuthSession]:
    """Generates a raw token, hashes it, and stores the AuthSession in the database."""
    raw_token = secrets.token_urlsafe(32)
    token_hash = hash_session_token(raw_token)
    
    expires_at = datetime.now(timezone.utc) + timedelta(days=expires_in_days)
    
    session_record = AuthSession(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=expires_at
    )
    
    db.add(session_record)
    db.commit()
    db.refresh(session_record)
    
    return raw_token, session_record

def get_session(db: Session, raw_token: str) -> tuple[User, AuthSession]:
    """Validates a raw token and returns the User and AuthSession if valid.
    Returns (None, None) if invalid, expired, or revoked."""
    if not raw_token:
        return None, None
        
    token_hash = hash_session_token(raw_token)
    
    session_record = db.query(AuthSession).filter(AuthSession.token_hash == token_hash).first()
    
    if not session_record:
        return None, None
        
    if session_record.revoked_at is not None:
        return None, None
        
    now = datetime.now(timezone.utc)
    # SQLite datetime is sometimes naive, let's compare properly
    # Ensure expires_at is aware or compare naively if needed, but since we use timezone.utc we should just compare safely
    if session_record.expires_at.tzinfo is None:
        now = now.replace(tzinfo=None)
        
    if session_record.expires_at < now:
        return None, None
        
    # Update last_used_at
    session_record.last_used_at = datetime.now(timezone.utc)
    db.commit()
    
    return session_record.user, session_record

def revoke_session(db: Session, raw_token: str) -> bool:
    """Marks a session as revoked."""
    if not raw_token:
        return False
        
    token_hash = hash_session_token(raw_token)
    session_record = db.query(AuthSession).filter(AuthSession.token_hash == token_hash).first()
    
    if session_record and not session_record.revoked_at:
        session_record.revoked_at = datetime.now(timezone.utc)
        db.commit()
        return True
        
    return False

def revoke_all_user_sessions(db: Session, user_id: int):
    """Revokes all active sessions for a user."""
    sessions = db.query(AuthSession).filter(
        AuthSession.user_id == user_id, 
        AuthSession.revoked_at.is_(None)
    ).all()
    
    now = datetime.now(timezone.utc)
    for s in sessions:
        s.revoked_at = now
        
    db.commit()
