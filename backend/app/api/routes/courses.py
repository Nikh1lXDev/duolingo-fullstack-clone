from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.course import Course
from app.schemas.course import Course as CourseSchema
from app.schemas.composite import CourseWithUnits

router = APIRouter()

@router.get("/", response_model=List[CourseSchema])
def get_courses(db: Session = Depends(get_db)):
    return db.query(Course).filter(Course.is_active == True).all()

@router.get("/{course_id}", response_model=CourseWithUnits)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course
