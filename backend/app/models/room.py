from sqlalchemy import Column, Float, Integer, String
from app.database.connection import Base

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String, unique=True, nullable=False)
    room_type = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    status = Column(String, default="available", nullable=False)
