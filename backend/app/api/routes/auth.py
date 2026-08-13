from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.auth import get_current_user
from app.schemas.auth import AuthRegisterRequest, AuthLoginRequest, AuthUserResponse
from app.services.auth import register_user, authenticate_user, DuplicateEmailError, DuplicateUsernameError, InvalidCredentialsError
from app.services.session import create_session, revoke_session

router = APIRouter()

@router.post("/register", response_model=AuthUserResponse, status_code=status.HTTP_201_CREATED)
def api_register(req: AuthRegisterRequest, db: Session = Depends(get_db)):
    try:
        user = register_user(db, req)
        return user
    except DuplicateEmailError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except DuplicateUsernameError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@router.post("/login", response_model=AuthUserResponse)
def api_login(req: AuthLoginRequest, response: Response, db: Session = Depends(get_db)):
    try:
        user = authenticate_user(db, req.username, req.password)
        
        raw_token, session_record = create_session(db, user.id, settings.AUTH_SESSION_EXPIRE_DAYS)
        
        # Set HttpOnly cookie
        response.set_cookie(
            key="duolingo_session",
            value=raw_token,
            httponly=True,
            samesite="lax",
            secure=False,  # False for local HTTP
            max_age=settings.AUTH_SESSION_EXPIRE_DAYS * 24 * 60 * 60,
        )
        
        return user
    except InvalidCredentialsError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.post("/logout")
def api_logout(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get("duolingo_session")
    if token:
        revoke_session(db, token)
        
    response.delete_cookie("duolingo_session")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=AuthUserResponse)
def api_get_me(current_user=Depends(get_current_user)):
    return current_user
