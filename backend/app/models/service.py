from sqlalchemy import Column, Integer, String, Float
from app.database.connection import Base

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    service_type = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(String, nullable=True)
