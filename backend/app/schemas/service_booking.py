from datetime import date
from pydantic import BaseModel
from typing import Optional

class ServiceBookingBase(BaseModel):
    service_id: int
    booking_date: date

class ServiceBookingCreate(ServiceBookingBase):
    pass

class ServiceBookingResponse(ServiceBookingBase):
    id: int
    user_id: int
    status: str

    class Config:
        from_attributes = True
