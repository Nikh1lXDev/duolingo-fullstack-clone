from pydantic import BaseModel

class Quest(BaseModel):
    id: str
    title: str
    description: str
    target: int
    progress: int
    completed: bool
    reward_xp: int = 0
