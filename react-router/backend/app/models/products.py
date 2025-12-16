from datetime import datetime
from sqlmodel import SQLModel, Field

class Product(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(nullable=False)
    slug: str = Field(nullable=False, unique=True)
    description: str = Field(nullable=True)  # si quieres tipo TEXT depende del motor, pero str sirve
    price_cents: int = Field(nullable=False)
    currency: str = Field(default="USD")
    stock: int = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow}
    )


# Additional Pydantic/SQLModel helper models to match the Hero pattern
class ProductBase(SQLModel):
    title: str
    slug: str
    description: str | None = None
    price_cents: int
    currency: str = "USD"
    stock: int


class ProductCreate(ProductBase):
    pass


class ProductPublic(ProductBase):
    id: int


class ProductUpdate(SQLModel):
    title: str | None = None
    slug: str | None = None
    description: str | None = None
    price_cents: int | None = None
    currency: str | None = None
    stock: int | None = None
