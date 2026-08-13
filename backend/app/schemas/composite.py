from pydantic import BaseModel
from typing import List, Optional
from .course import Course
from .unit import Unit
from .skill import Skill
from .lesson import Lesson
from .exercise import Exercise

class SkillWithLessons(Skill):
    lessons: List[Lesson] = []

class UnitWithSkills(Unit):
    skills: List[SkillWithLessons] = []

class CourseWithUnits(Course):
    units: List[UnitWithSkills] = []

class LessonWithExercises(Lesson):
    exercises: List[Exercise] = []
