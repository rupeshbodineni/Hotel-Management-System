from sqlalchemy import Column,Integer,String,ForeignKey
from .user import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True,index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    room_id = Column(Integer, ForeignKey("rooms.id"))

    check_in = Column(String)

    check_out = Column(String)

    status = Column(String, default="pending")