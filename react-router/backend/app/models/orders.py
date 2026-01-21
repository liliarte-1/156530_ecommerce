from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING
from typing import Optional

#avoid interpreter warning
if TYPE_CHECKING:
    from app.models.users1 import UserInDB
    from app.models.orderItems import OrderItemInDB

class OrderInDB(SQLModel, table=True):
    __tablename__ = "order"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field (foreign_key="users.id")
    status: str 
    total_cents: int
    currency: str = Field(default="USD")
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # relation 1-> N: and order has many items
    items: list["OrderItemInDB"] = Relationship(back_populates="order")

    # relation 1-> N: many orders for one user (user can make many orders)
    user: Optional["UserInDB"] = Relationship(back_populates="orders")



class OrderCreate(SQLModel):
    currency: str = "USD"


class OrderRead(SQLModel):
    id: int
    user_id: int
    status: str
    total_cents: int
    currency: str
    created_at: datetime


