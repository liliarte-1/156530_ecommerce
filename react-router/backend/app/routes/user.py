import logging
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.models.user import (
    User,
    UserBase,
)
from app.dependencies import SessionDep

router = APIRouter()

logger = logging.getLogger("uvicorn")

@router.post("/auth/register", response_model=User)
def register_user(user: UserBase, session: SessionDep):
    logger.info(f"Registering user with email: {user.name}")
    existing_user = session.exec(select(User).where(User.email == user.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = User.model_validate(user)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

# cambiar lo del tutorial de authentication
@router.post("/auth/login", response_model=User)
def login_user(email: str, password: str, session: SessionDep):
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Here you would normally verify the password
    if User.password_hash == password:  # Placeholder assignment
        verify_password = True
    else:
        verify_password = False
    if not verify_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")  
    return user