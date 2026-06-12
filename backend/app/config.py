from pydantic import BaseSettings
import os


class Settings(BaseSettings):
    # App Info
    APP_NAME: str = "Hotel Management System"
    DEBUG: bool = True

    # Database (PostgreSQL example)
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "password"
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"
    DB_NAME: str = "hotel_db"

    # JWT Authentication
    SECRET_KEY: str = "your_secret_key_here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Payment (if using mock or Stripe later)
    PAYMENT_CURRENCY: str = "INR"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+psycopg2://{self.DB_USER}:"
            f"{self.DB_PASSWORD}@{self.DB_HOST}:"
            f"{self.DB_PORT}/{self.DB_NAME}"
        )


# Load settings
settings = Settings()