from sqlalchemy import Column, Integer, String, Float, Date, Boolean
from app.database.connection import Base

class Coupon(Base):
    __tablename__ = "coupons"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    discount_percent = Column(Float, nullable=False)
    valid_until = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
