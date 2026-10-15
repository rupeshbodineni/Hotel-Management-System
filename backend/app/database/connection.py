import os
from urllib.parse import quote_plus

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "hotel_management")
DATABASE_URL = os.getenv("DATABASE_URL")

# Treat placeholder/example passwords as "not set"
_PLACEHOLDER = "your_mysql_password_here"
if DB_PASSWORD == _PLACEHOLDER:
    DB_PASSWORD = ""

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if not DATABASE_URL:
    if DB_PASSWORD:
        # Real MySQL credentials provided (local dev / production MySQL)
        DATABASE_URL = (
            f"mysql+pymysql://{DB_USER}:{quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
            "?charset=utf8mb4"
        )
    else:
        # SQLite fallback — works on Render free tier with no external DB
        DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'hotel.db')}"

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    future=True,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
