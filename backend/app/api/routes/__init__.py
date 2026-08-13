from fastapi import APIRouter
from app.api.routes import courses, units, skills, lessons, users, leaderboard, auth

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(units.router, prefix="/units", tags=["units"])
api_router.include_router(skills.router, prefix="/skills", tags=["skills"])
api_router.include_router(lessons.router, prefix="/lessons", tags=["lessons"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(leaderboard.router, prefix="/leaderboard", tags=["leaderboard"])
