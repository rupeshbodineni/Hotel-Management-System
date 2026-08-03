from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.sql import func
from app.database.connection import Base

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String, default="unknown", nullable=False)
    payment_status = Column(String, default="pending", nullable=False)
    payment_date = Column(DateTime(timezone=True), server_default=func.now())
