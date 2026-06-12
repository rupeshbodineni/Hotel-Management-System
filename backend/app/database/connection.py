from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

Base = declarative_base()
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env file")

engine = create_engine(DATABASE_URL, pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)