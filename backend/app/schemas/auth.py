from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class AuthRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    display_name: Optional[str] = None

class AuthLoginRequest(BaseModel):
    username: str
    password: str

class AuthUserResponse(BaseModel):
    id: int
    username: str
    email: str
    display_name: Optional[str] = None
    avatar: Optional[str] = None
