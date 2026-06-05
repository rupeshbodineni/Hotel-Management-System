from sqlalchemy import Column,Integer,Float,String,ForeignKey
from .user import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True,index=True)

    booking_id = Column(Integer,
                        ForeignKey("bookings.id"))

    amount = Column(Float)

    payment_status = Column(
        String,
        default="pending"
    )