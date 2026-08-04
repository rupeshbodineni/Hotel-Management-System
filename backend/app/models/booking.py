from sqlalchemy import Column, Date, Float, ForeignKey, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base


class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    customer_name = Column(String, nullable=False, default="Guest")
    customer_email = Column(String, nullable=False, default="guest@example.com")
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    guests = Column(Integer, default=2, nullable=False)
    coupon_code = Column(String, nullable=True)
    discount_amount = Column(Float, default=0.0, nullable=False)
    total_amount = Column(Float, nullable=False, default=0.0)
    status = Column(String, default="pending", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)


    user = relationship("User", backref="bookings")
    room = relationship("Room", backref="bookings")
