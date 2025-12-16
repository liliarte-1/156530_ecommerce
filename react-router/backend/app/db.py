from sqlmodel import Session, SQLModel, create_engine
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent
sqlite_file_path = BASE_DIR / "database.db"
sqlite_url = f"sqlite:///{sqlite_file_path}"

database_url = os.environ.get("DATABASE_URL")
# database_url = "postgresql://postgres.pngzytvvzjcvxzmeoaih:estanoesbroki"34@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"

connect_args = {"check_same_thread": False} 
engine = create_engine(database_url, connect_args=connect_args)


def create_db_and_tables():
    # Import models so SQLModel metadata includes them when creating tables
    from app.models import hero
    from app.models import products
    from app.models import user
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
