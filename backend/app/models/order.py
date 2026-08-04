from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base

class RestaurantOrder(Base):
    __tablename__ = "restaurant_orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    room_number = Column(String, nullable=True)
    items = Column(String, nullable=True)  # Store JSON representation of order items
    total_amount = Column(Float, nullable=False, default=0.0)
    order_type = Column(String, nullable=False, default="room_service")  # room_service or table_reservation
    reservation_date = Column(Date, nullable=True)
    reservation_time = Column(String, nullable=True)
    status = Column(String, default="pending", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="restaurant_orders")
