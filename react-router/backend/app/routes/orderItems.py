from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, SQLModel, Field, select

from app.db import get_session
from app.models.orders import OrderInDB
from app.models.orderItems import OrderItemInDB, OrderItemCreate, OrderItemUpdate, OrderItemRead
from app.models.products1 import ProductInDB
from app.models.users1 import UserInDB
from app.routes.users1 import get_current_user  

router = APIRouter(prefix="/order-items", tags=["order-items"])
SessionDep = Annotated[Session, Depends(get_session)]
CurrentUser = Annotated[UserInDB, Depends(get_current_user)]


def recalc_order_total(session: Session, order_id: int) -> None:
    items = session.exec(select(OrderItemInDB).where(OrderItemInDB.order_id == order_id)).all()
    total = sum(i.unit_price_cents * i.quantity for i in items)

    order = session.get(OrderInDB, order_id)
    if order:
        order.total_cents = total
        session.add(order)
        session.commit()
        session.refresh(order)


@router.post("/", response_model=OrderItemRead, status_code=status.HTTP_201_CREATED)
def create_order_item(payload: OrderItemCreate, session: SessionDep, current_user: CurrentUser):
    order = session.get(OrderInDB, payload.order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")

    product = session.get(ProductInDB, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    item = OrderItemInDB(
        order_id=payload.order_id,
        product_id=payload.product_id,
        unit_price_cents=product.price_cents,
        quantity=payload.quantity,
    )
    session.add(item)
    session.commit()
    session.refresh(item)

    recalc_order_total(session, payload.order_id)
    return item


@router.get("/", response_model=list[OrderItemRead])
def list_order_items(
    session: SessionDep,
    current_user: CurrentUser,
    order_id: Optional[int] = None,
    offset: int = 0,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
):
    stmt = select(OrderItemInDB).offset(offset).limit(limit)

    if order_id is not None:
        order = session.get(OrderInDB, order_id)
        if not order or order.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Order not found")
        stmt = stmt.where(OrderItemInDB.order_id == order_id)

    return session.exec(stmt).all()


@router.patch("/{item_id}", response_model=OrderItemRead)
def update_order_item(item_id: int, patch: OrderItemUpdate, session: SessionDep, current_user: CurrentUser):
    item = session.get(OrderItemInDB, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")

    order = session.get(OrderInDB, item.order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")

    data = patch.model_dump(exclude_unset=True)
    if "quantity" in data:
        item.quantity = data["quantity"]

    session.add(item)
    session.commit()
    session.refresh(item)

    recalc_order_total(session, item.order_id)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order_item(item_id: int, session: SessionDep, current_user: CurrentUser):
    item = session.get(OrderItemInDB, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")

    order = session.get(OrderInDB, item.order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")

    order_id = item.order_id
    session.delete(item)
    session.commit()

    recalc_order_total(session, order_id)
    return None
