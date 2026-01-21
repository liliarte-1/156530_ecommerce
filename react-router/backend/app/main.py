from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]   # backend/
load_dotenv(ROOT_DIR / ".env")

print("DATABASE_URL:", os.getenv("DATABASE_URL"))

from .db import create_db_and_tables
from .routes import health
from .routes import products1
from .routes import users1
from .routes import orders, orderItems


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

# Configure CORS policy.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://156530-ecommerce.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers.
app.include_router(health.router)
app.include_router(products1.router)
app.include_router(orders.router)
app.include_router(orderItems.router)
app.include_router(users1.router)


