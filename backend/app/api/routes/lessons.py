from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.lesson import Lesson
from app.schemas.composite import LessonWithExercises
from typing import Optional

from app.services.exercise_generator import generate_exercises_for_lesson

router = APIRouter()

@router.get("/{lesson_id}", response_model=LessonWithExercises)
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    seed: Optional[int] = Query(None, description="Random seed for deterministic exercise generation. Omit for random order each call.")
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # seed=None → fresh random per call (exercises vary each time)
    # seed=<int> → deterministic (useful for testing)
    dynamic_exercises = generate_exercises_for_lesson(db, lesson, seed=seed)
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
