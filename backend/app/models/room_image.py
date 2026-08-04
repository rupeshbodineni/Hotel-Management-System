from sqlalchemy import Column, Integer, String, ForeignKey
from app.database.connection import Base

class RoomImage(Base):
    __tablename__ = "room_images"
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    image_url = Column(String, nullable=False)
