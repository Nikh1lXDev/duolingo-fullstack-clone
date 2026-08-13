from pwdlib import PasswordHash
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.user import User, UserStats, UserSettings
from app.schemas.auth import AuthRegisterRequest

password_hash = PasswordHash.recommended()

class AuthError(Exception):
    pass

class DuplicateEmailError(AuthError):
    pass

class DuplicateUsernameError(AuthError):
    pass

class InvalidCredentialsError(AuthError):
    pass

def hash_password(password: str) -> str:
    return password_hash.hash(password)

def verify_password(password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    return password_hash.verify(password, hashed_password)

def register_user(db: Session, req: AuthRegisterRequest) -> User:
    # Check duplicates
    if db.query(User).filter(User.email == req.email).first():
        raise DuplicateEmailError("Email already registered")
    if db.query(User).filter(User.username == req.username).first():
        raise DuplicateUsernameError("Username already registered")
        
    hashed = hash_password(req.password)
    
    avatar = f"https://ui-avatars.com/api/?name={req.display_name or req.username}"
    
    new_user = User(
        username=req.username,
        email=req.email,
        display_name=req.display_name,
        avatar=avatar,
        password_hash=hashed
    )
    
    db.add(new_user)
    try:
        db.flush()
        
        # Safe defaults as Demo Learner
        new_stats = UserStats(
            user_id=new_user.id,
            xp=0,
            gems=500,
            hearts=5,
            streak=0,
            longest_streak=0,
            daily_xp_goal=20,
            daily_xp_progress=0,
            lessons_completed=0
        )
        db.add(new_stats)
        
        new_settings = UserSettings(
            user_id=new_user.id,
            sound_enabled=True,
            notifications_enabled=True,
            course_language="es"
        )
        db.add(new_settings)
        
        db.commit()
        db.refresh(new_user)
        return new_user
    except IntegrityError:
        db.rollback()
        raise AuthError("Database integrity error")
    except Exception:
        db.rollback()
        raise

def authenticate_user(db: Session, username_or_email: str, password: str) -> User:
    user = db.query(User).filter((User.username == username_or_email) | (User.email == username_or_email)).first()
    if not user:
        raise InvalidCredentialsError("Invalid credentials")
        
    if not user.password_hash:
        raise InvalidCredentialsError("Invalid credentials")
        
    if not verify_password(password, user.password_hash):
        raise InvalidCredentialsError("Invalid credentials")
        
    return user
