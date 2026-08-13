from pydantic import BaseModel
from typing import List
from .course import Course
from .unit import Unit
from .skill import Skill
from .progress import UserSkillProgress

class LearningPathSkill(Skill):
    progress: int = 0
    crowns: int = 0
    locked: bool = True

class LearningPathUnit(Unit):
    skills: List[LearningPathSkill] = []

class LearningPathResponse(BaseModel):
    course: Course
    units: List[LearningPathUnit] = []
