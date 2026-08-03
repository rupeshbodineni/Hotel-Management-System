from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

# Load environment variables from your .env file
load_dotenv()

# Fetch the database URL from the environment.
# Make sure your .env file has: DATABASE_URL=mysql+pymysql://user:password@localhost:3306/hotel_db
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# MySQL engine setup
# We remove 'check_same_thread' as it is only needed for SQLite
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Database Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()