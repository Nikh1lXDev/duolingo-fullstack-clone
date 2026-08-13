from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String)
    icon = Column(String)
    order_index = Column(Integer, nullable=False)
    is_locked = Column(Boolean, default=True)
    xp_reward = Column(Integer, default=10)
    
    unit = relationship("Unit", back_populates="skills")
    lessons = relationship("Lesson", back_populates="skill", cascade="all, delete-orphan", order_by="Lesson.order_index")
    user_progress = relationship("UserSkillProgress", back_populates="skill", cascade="all, delete-orphan")
    vocabulary_items = relationship("VocabularyItem", back_populates="skill", cascade="all, delete-orphan")

