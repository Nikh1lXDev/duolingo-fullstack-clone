from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from app.models.user import User, UserStats

def get_leaderboard(db: Session, current_user_id: int):
    # Sort by xp DESC, streak DESC, user_id ASC
    users_with_stats = db.query(User, UserStats).join(UserStats, User.id == UserStats.user_id).order_by(
        desc(UserStats.xp),
        desc(UserStats.streak),
        asc(User.id)
    ).all()

    entries = []
    current_user_rank = None
    
    for idx, (user, stats) in enumerate(users_with_stats, start=1):
        entries.append({
            "rank": idx,
            "user_id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "avatar": user.avatar,
            "xp": stats.xp,
            "streak": stats.streak
        })
        if user.id == current_user_id:
            current_user_rank = idx
            
    return {
        "entries": entries,
        "current_user_rank": current_user_rank
    }
