from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional
from typing import TYPE_CHECKING

#avoid interpreter warning
if TYPE_CHECKING:
    from app.models.orders import OrderInDB


class UserInDB(SQLModel, table=True):
    __tablename__ = "users"
    id: int | None = Field(default=None, primary_key=True)
    username: str
    email: str
    hashed_password: str
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    orders: list["OrderInDB"] = Relationship(back_populates="user")

class UserAuth(SQLModel):
    username: str
    email: str
    password: str

class UserRead(SQLModel):
    id: int
    username: str
    email: str
    is_admin: bool
    created_at: datetime



