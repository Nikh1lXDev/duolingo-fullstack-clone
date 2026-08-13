from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class VocabularyItem(Base):
    __tablename__ = "vocabulary_items"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=True, index=True)
    source_text = Column(String, nullable=False)
    target_text = Column(String, nullable=False)
    category = Column(String, default="general")
    difficulty = Column(Integer, default=1)
    pronunciation = Column(String, nullable=True)

    course = relationship("Course", back_populates="vocabulary_items")
    skill = relationship("Skill", back_populates="vocabulary_items")
