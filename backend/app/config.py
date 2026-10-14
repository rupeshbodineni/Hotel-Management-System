from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    # App Info
    APP_NAME: str = "Hotel Management System"
    DEBUG: bool = True

    # JWT Authentication
    SECRET_KEY: str = "royal-hotel-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Payment currency
    PAYMENT_CURRENCY: str = "INR"

    class Config:
        env_file = ".env"
        extra = "allow"


# Load settings
settings = Settings()