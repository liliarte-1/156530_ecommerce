from sqlmodel import Session, SQLModel, create_engine
from pathlib import Path
from dotenv import load_dotenv
import os
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent


database_url = os.environ.get("DATABASE_URL")

# database_url = "postgresql://postgres.pngzytvvzjcvxzmeoaih:estanoesbroki"34@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"
if database_url:
# engine = create_engine(database_url, connect_args=connect_args)
    engine = create_engine(database_url, echo=True)
else:
    sqlite_file_path = BASE_DIR / "database.db"
    sqlite_url = f"sqlite:///{sqlite_file_path}"
    connect_args = {"check_same_thread": False} 
    engine = create_engine(sqlite_url, connect_args=connect_args)

def create_db_and_tables():
    # Import models so SQLModel metadata includes them when creating tables
    from app.models import products1
    from app.models import users1
    from app.models import orders
    from app.models import orderItems
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session

