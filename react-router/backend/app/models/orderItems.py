from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship 
from typing import TYPE_CHECKING
from typing import Optional

#avoid interpreter warning
if TYPE_CHECKING:
    from app.models.orders import OrderInDB
    from app.models.products1 import ProductInDB

class OrderItemInDB(SQLModel, table=True):
    __tablename__ = "order_items"
    id: int | None = Field(default=None, primary_key=True)
    order_id : int = Field (foreign_key="order.id")
    product_id : int = Field (foreign_key="product.id")
    unit_price_cents: int
    quantity: int = Field(ge=1)

# realation N-> 1: many items in an order 
    order: Optional["OrderInDB"] = Relationship(back_populates="items")

# relation N-> 1 : muchos items referencian un product
    product: Optional["ProductInDB"] = Relationship()

    
class OrderItemCreate(SQLModel):
    order_id: int
    product_id: int
    quantity: int = Field(ge=1)


class OrderItemRead(SQLModel):
    id: int
    order_id: int
    product_id: int
    unit_price_cents: int
    quantity: int


class OrderItemUpdate(SQLModel):
    quantity: int = Field(default=None, ge=1)