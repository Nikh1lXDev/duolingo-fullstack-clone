from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False) # multiple_choice, translate, word_bank, match_pairs, fill_blank, type_answer
    prompt = Column(String, nullable=False)
    correct_answer = Column(String, nullable=False)
    options = Column(Text) # JSON string representation
    translation = Column(String)
    order_index = Column(Integer, nullable=False)
    xp_reward = Column(Integer, default=2)
    
    lesson = relationship("Lesson", back_populates="exercises")
