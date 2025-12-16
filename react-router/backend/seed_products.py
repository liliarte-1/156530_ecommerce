"""Seed script to create initial products in the database.

Run from the `backend` folder with:

    python seed_products.py

It will create the DB/tables (if missing) and insert a few example products
if no products exist yet.
"""
from sqlmodel import Session, select
from app.db import engine, create_db_and_tables
from app.models.products import Product


def seed():
    create_db_and_tables()
    with Session(engine) as session:
        existing = session.exec(select(Product)).first()
        if existing:
            print("Products already present — skipping seed.")
            return

        items = [
            Product(
                title="Café Molido Premium",
                slug="cafe-molido-premium",
                description="Café molido de origen latinoamericano, 250g.",
                price_cents=999,
                currency="USD",
                stock=50,
            ),
            Product(
                title="Auriculares Bluetooth",
                slug="auriculares-bluetooth",
                description="Auriculares inalámbricos con cancelación de ruido.",
                price_cents=4599,
                currency="USD",
                stock=15,
            ),
            Product(
                title="Camiseta Básica",
                slug="camiseta-basica",
                description="Camiseta de algodón, disponible en varias tallas.",
                price_cents=1999,
                currency="USD",
                stock=120,
            ),
        ]

        session.add_all(items)
        session.commit()
        print(f"Seeded {len(items)} products.")


if __name__ == "__main__":
    seed()
