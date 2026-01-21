import logging
from typing import Annotated, Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlmodel import Session, select

from app.db import get_session
from app.models.products1 import ProductInDB, ProductRead, ProductPublic

router = APIRouter()
logger = logging.getLogger("uvicorn")

SessionDep = Annotated[Session, Depends(get_session)]




@router.post("/products/", response_model=ProductPublic, status_code=201)
def create_product(product: ProductRead, session: SessionDep):
    # evitar 500 por unique slug
    existing = session.exec(
        select(ProductInDB).where(ProductInDB.slug == product.slug)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Slug already exists")

    db_product = ProductInDB(**product.model_dump())
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product


@router.get("/products/", response_model=list[ProductPublic])
def read_products(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
):
    products = session.exec(
        select(ProductInDB).offset(offset).limit(limit)
    ).all()
    logger.info(f"Retrieved products: {len(products)}")
    return products


@router.get("/products/{product_id}", response_model=ProductPublic)
def read_product(product_id: int, session: SessionDep):
    product = session.get(ProductInDB, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.patch("/products/{product_id}", response_model=ProductPublic)
def update_product(product_id: int, patch: ProductRead, session: SessionDep):
    product_db = session.get(ProductInDB, product_id)
    if not product_db:
        raise HTTPException(status_code=404, detail="Product not found")

    data = patch.model_dump(exclude_unset=True)

    # si actualizas slug, comprobar colisión
    if "slug" in data:
        existing = session.exec(
            select(ProductInDB).where(
                ProductInDB.slug == data["slug"],
                ProductInDB.id != product_id,
            )
        ).first()
        if existing:
            raise HTTPException(status_code=409, detail="Slug already exists")

    product_db.sqlmodel_update(data)
    session.add(product_db)
    session.commit()
    session.refresh(product_db)
    return product_db


@router.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int, session: SessionDep):
    product = session.get(ProductInDB, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    session.delete(product)
    session.commit()
    return None
