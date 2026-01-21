from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING
from typing import Optional

#avoid interpreter warning
if TYPE_CHECKING:
    from app.models.orders import OrderItemInDB


class ProductInDB(SQLModel, table=True):
    __tablename__ = "product"
    id: int | None = Field(default=None, primary_key=True)
    title: str 
    slug: str = Field(index=True, nullable=False, unique=True)
    description: str | None = None
    price_cents: int
    currency: str = Field(default="USD")
    stock: int
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    order_items: list["OrderItemInDB"] = Relationship()


class ProductRead(SQLModel):
    title: str
    slug: str = Field(index=True, nullable=False, unique=True)
    description: str | None = None
    price_cents: int
    currency: str = Field(default="USD")
    stock: int



class ProductPublic(ProductRead):
    id: int
    created_at: datetime
    updated_at: datetime

