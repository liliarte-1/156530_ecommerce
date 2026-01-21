from datetime import datetime
from typing import Annotated, Optional
from app.dependencies import SessionDep

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, SQLModel, Field, select

from app.db import get_session
from app.models.orders import OrderInDB, OrderCreate, OrderRead
from app.models.users1 import UserInDB
from app.routes.users1 import get_current_user 

router = APIRouter(prefix="/orders", tags=["orders"])
CurrentUser = Annotated[UserInDB, Depends(get_current_user)]

@router.post("/", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, session: SessionDep, current_user: CurrentUser):
    order = OrderInDB(
        user_id=current_user.id,
        status="pending",
        total_cents=0,
        currency=payload.currency,
    )
    session.add(order)
    session.commit()
    session.refresh(order)
    return order


@router.get("/", response_model=list[OrderRead])
def list_orders(
    session: SessionDep,
    current_user: CurrentUser,
    offset: int = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
):
    stmt = (
        select(OrderInDB)
        .where(OrderInDB.user_id == current_user.id)
        .offset(offset)
        .limit(limit)
    )
    return session.exec(stmt).all()


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: int, session: SessionDep, current_user: CurrentUser):
    order = session.get(OrderInDB, order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}", response_model=OrderRead)
def update_order_status(
    order_id: int,
    status_value: str,
    session: SessionDep,
    current_user: CurrentUser,
):
    order = session.get(OrderInDB, order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status_value
    session.add(order)
    session.commit()
    session.refresh(order)
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, session: SessionDep, current_user: CurrentUser):
    order = session.get(OrderInDB, order_id)
    if not order or order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")

    session.delete(order)
    session.commit()
    return None
