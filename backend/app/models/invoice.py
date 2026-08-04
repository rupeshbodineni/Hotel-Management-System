from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database.connection import Base

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    invoice_number = Column(String, unique=True, index=True, nullable=False)
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0.0, nullable=False)
    discount = Column(Float, default=0.0, nullable=False)
    total = Column(Float, nullable=False)
    status = Column(String, default="unpaid", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
