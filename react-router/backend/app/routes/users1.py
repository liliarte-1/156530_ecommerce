from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional
from fastapi import APIRouter, Depends

import jwt
from fastapi import Depends , HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from sqlmodel import Session, select
from app.db import get_session

from app.models.users1 import UserRead, UserInDB, UserAuth

SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter()

password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def get_user_by_email(session: Session, email: str) -> Optional[UserInDB]:
    # get only works for pks, so we need the select
    stmt = select(UserInDB).where(UserInDB.email == email)
    return session.exec(stmt).first()


def get_user_by_id(session: Session, user_id: int) -> Optional[UserInDB]:
    return session.get(UserInDB, user_id)


def authenticate_user(session: Session, email: str, password: str) -> UserInDB:
    user = get_user_by_email(session, email)

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[Session, Depends(get_session)],
    ) -> UserRead:
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exception
        user_id = int(sub)
    except (InvalidTokenError, ValueError, TypeError):
        raise credentials_exception

    user_db = get_user_by_id(session, user_id)
    if user_db is None:
        raise credentials_exception

    return (user_db)



# eso es basicamente el endpoint de login, auth/login, pero lo dejo con token por comodidad y por el codigo que nos proporciona el tutorial de fastapi
@router.post("/auth/login")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[Session, Depends(get_session)],
):
    user = authenticate_user(session, email=form_data.username, password=form_data.password)

    # guardamos el id en sub
    access_token = create_access_token(
        data={"sub": str(user.id)})
    return {"access_token":access_token, "token_type":"bearer"}


@router.get("/users/me", response_model=UserRead)
async def read_users_me(
    current_user: Annotated[UserInDB, Depends(get_current_user)],
) -> UserRead:
    print(current_user)
    return current_user

@router.post("/auth/register", response_model=UserRead)
async def register_user(
    user: UserAuth,
    session: Session = Depends(get_session),
):
    existing_user = get_user_by_email(session, user.email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    new_user = UserInDB(
        username=user.username,
        email=user.email,
        hashed_password=password_hash.hash(user.password), 
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return (new_user)



