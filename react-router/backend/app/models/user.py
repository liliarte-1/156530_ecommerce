from datetime import datetime
from sqlmodel import SQLModel, Field

class UserBase(SQLModel):
    id:  int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    email: str = Field(index=True, unique=True)
    password_hash: str


class User(UserBase, table=True):
    is_admin: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)



# class UserPublic(UserBase):
#     id: int = Field(default=None, primary_key=True)

# class UserCreate(SQLModel):
#     name: str | None = None
#     age: int | None = None
#     secret_name: str | None = None