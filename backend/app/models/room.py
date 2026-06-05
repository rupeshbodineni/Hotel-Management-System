from sqlalchemy import Column,Integer,String,Float
from .user import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True,index=True)
    room_number = Column(String)
    room_type = Column(String)
    price = Column(Float)
    status = Column(String, default="available")