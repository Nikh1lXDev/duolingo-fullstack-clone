from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String)
    avatar = Column(String)
    password_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    stats = relationship("UserStats", back_populates="user", uselist=False, cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    skill_progress = relationship("UserSkillProgress", back_populates="user", cascade="all, delete-orphan")
    lesson_progress = relationship("UserLessonProgress", back_populates="user", cascade="all, delete-orphan")
    auth_sessions = relationship("AuthSession", back_populates="user", cascade="all, delete-orphan")

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    sound_enabled = Column(Boolean, default=True)
    notifications_enabled = Column(Boolean, default=True)
    course_language = Column(String, default="es")
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="settings")
    course = relationship("Course")



class UserStats(Base):
    __tablename__ = "user_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    xp = Column(Integer, default=0)
    gems = Column(Integer, default=500)
    hearts = Column(Integer, default=5)
    streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    daily_xp_goal = Column(Integer, default=20)
    daily_xp_progress = Column(Integer, default=0)
    daily_xp_date = Column(Date, nullable=True)
    last_heart_refill_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_heart_deduction_id = Column(String, nullable=True)
    lessons_completed = Column(Integer, default=0)
    last_activity_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="stats")
