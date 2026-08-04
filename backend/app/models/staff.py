from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Staff(Base):
    __tablename__ = "staff"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    department = Column(String, nullable=False)
    salary = Column(Float, nullable=False)
    shift = Column(String, default="morning", nullable=False)
    attendance = Column(String, default="[]")  # JSON string of dates
    performance = Column(String, nullable=True)
    leave_balance = Column(Integer, default=15, nullable=False)

    user = relationship("User", backref="staff_profile")
