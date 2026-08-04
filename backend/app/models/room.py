from sqlalchemy import Column, Float, Integer, String
from app.database.connection import Base

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String, unique=True, nullable=False)
    room_type = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    capacity = Column(Integer, default=2, nullable=False)
    floor_number = Column(Integer, default=1, nullable=False)
    discount = Column(Float, default=0.0, nullable=False)
    is_featured = Column(Integer, default=0, nullable=False) # Store as 0 or 1 for SQLite compatibility or Boolean
    description = Column(String, nullable=True)
    amenities = Column(String, nullable=True) # comma separated
    image_url = Column(String, nullable=True)
    status = Column(String, default="available", nullable=False)

