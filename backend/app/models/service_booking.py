from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.database.connection import Base

class ServiceBooking(Base):
    __tablename__ = "service_bookings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    booking_date = Column(Date, nullable=False)
    status = Column(String, default="confirmed", nullable=False)

    user = relationship("User", backref="service_bookings")
    service = relationship("Service", backref="service_bookings")
