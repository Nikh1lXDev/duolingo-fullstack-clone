from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.user import User
from app.models.course import Course
from app.models.unit import Unit
from app.models.skill import Skill
from app.models.progress import UserSkillProgress, UserLessonProgress
from app.schemas.user import UserProfile
from app.schemas.progress import UserSkillProgress as UserSkillProgressSchema, UserLessonProgress as UserLessonProgressSchema, UserLessonProgressUpdate
from app.schemas.learning_path import LearningPathResponse, LearningPathUnit, LearningPathSkill
from app.models.lesson import Lesson
from app.schemas.composite import LessonWithExercises
from datetime import datetime, timezone
from app.schemas.profile import ProfileResponse
from app.services.profile import get_user_profile
from typing import List
from app.schemas.quests import Quest
from app.services.quests import get_daily_quests
from app.schemas.settings import UserSettingsResponse, UserSettingsUpdate
from app.services.settings import get_user_settings, update_user_settings

from pydantic import BaseModel
class DeductHeartRequest(BaseModel):
    deduction_id: str

from app.services.gamification import (
    process_lesson_completion,
    deduct_heart,
    refill_hearts,
    get_user_stats,
    GamificationError
)

router = APIRouter()

# --- AUTHENTICATED /me ROUTES ---

@router.get("/me/profile", response_model=ProfileResponse)
def get_me_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_user_profile(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return profile

@router.get("/me/quests", response_model=List[Quest])
def get_me_quests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return get_daily_quests(db, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me/settings", response_model=UserSettingsResponse)
def get_me_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_user_settings(db, current_user.id)

@router.put("/me/settings", response_model=UserSettingsResponse)
def update_me_settings(payload: UserSettingsUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return update_user_settings(db, current_user.id, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me/progress")
def get_me_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    skill_progress = db.query(UserSkillProgress).filter(UserSkillProgress.user_id == current_user.id).all()
    lesson_progress = db.query(UserLessonProgress).filter(UserLessonProgress.user_id == current_user.id).all()
    
    return {
        "skill_progress": skill_progress,
        "lesson_progress": lesson_progress
    }

@router.get("/me/learning-path", response_model=LearningPathResponse)
def get_me_learning_path(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_settings = get_user_settings(db, current_user.id)
    course = None
    if user_settings.course_id:
        course = db.query(Course).filter(Course.id == user_settings.course_id, Course.is_active == True).first()
    if not course:
        course = db.query(Course).filter(Course.is_active == True).first()
    if not course:
        raise HTTPException(status_code=404, detail="Active course not found")
        
    units = db.query(Unit).filter(Unit.course_id == course.id).order_by(Unit.order_index).all()
    progress_records = db.query(UserSkillProgress).filter(UserSkillProgress.user_id == current_user.id).all()
    progress_dict = {p.skill_id: p for p in progress_records}
    
    learning_path_units = []
    is_next_unlocked = True
    
    for unit in units:
        lp_skills = []
        skills = db.query(Skill).filter(Skill.unit_id == unit.id).order_by(Skill.order_index).all()
        
        for skill in skills:
            prog = progress_dict.get(skill.id)
            completed = prog.completed if prog else False
            locked = not is_next_unlocked
            
            if not completed:
                is_next_unlocked = False
            else:
                is_next_unlocked = True
                
            lp_skill = LearningPathSkill(
                id=skill.id, unit_id=skill.unit_id, title=skill.title, description=skill.description,
                icon=skill.icon, order_index=skill.order_index, is_locked=skill.is_locked,
                xp_reward=skill.xp_reward, progress=prog.progress if prog else 0, crowns=prog.crowns if prog else 0, locked=locked
            )
            lp_skills.append(lp_skill)
            
        lp_unit = LearningPathUnit(
            id=unit.id, course_id=unit.course_id, title=unit.title, description=unit.description,
            order_index=unit.order_index, is_locked=unit.is_locked, skills=lp_skills
        )
        learning_path_units.append(lp_unit)
        
    return LearningPathResponse(course=course, units=learning_path_units)

from app.services.exercise_generator import generate_exercises_for_lesson

@router.get("/me/skills/{skill_id}/next-lesson", response_model=LessonWithExercises)
def get_me_next_lesson(skill_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lessons = db.query(Lesson).filter(Lesson.skill_id == skill_id).order_by(Lesson.order_index).all()
    if not lessons:
        raise HTTPException(status_code=404, detail="No lessons found for this skill")
        
    progress_records = db.query(UserLessonProgress).filter(UserLessonProgress.user_id == current_user.id).all()
    completed_lesson_ids = {p.lesson_id for p in progress_records if p.completed}
    
    target_lesson = lessons[0]
    for lesson in lessons:
        if lesson.id not in completed_lesson_ids:
            target_lesson = lesson
            break
            
    dynamic_exercises = generate_exercises_for_lesson(db, target_lesson, user_id=current_user.id)
    return LessonWithExercises(
        id=target_lesson.id,
        skill_id=target_lesson.skill_id,
        title=target_lesson.title,
        description=target_lesson.description,
        order_index=target_lesson.order_index,
        xp_reward=target_lesson.xp_reward,
        difficulty=target_lesson.difficulty,
        exercises=dynamic_exercises
    )

@router.post("/me/lessons/{lesson_id}/progress", response_model=UserLessonProgressSchema)
def update_me_lesson_progress(lesson_id: int, payload: UserLessonProgressUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return process_lesson_completion(db, current_user.id, lesson_id, payload.score)
    except GamificationError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/me/hearts/deduct")
def api_me_deduct_heart(payload: DeductHeartRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return deduct_heart(db, current_user.id, payload.deduction_id)
    except GamificationError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/me/hearts/refill")
def api_me_refill_hearts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        return refill_hearts(db, current_user.id)
    except GamificationError as e:
        raise HTTPException(status_code=400, detail=str(e))


