from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.lesson import Lesson
from app.schemas.composite import LessonWithExercises

from app.services.exercise_generator import generate_exercises_for_lesson

router = APIRouter()

@router.get("/{lesson_id}", response_model=LessonWithExercises)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    dynamic_exercises = generate_exercises_for_lesson(db, lesson)
    return LessonWithExercises(
        id=lesson.id,
        skill_id=lesson.skill_id,
        title=lesson.title,
        description=lesson.description,
        order_index=lesson.order_index,
        xp_reward=lesson.xp_reward,
        difficulty=lesson.difficulty,
        exercises=dynamic_exercises
    )

