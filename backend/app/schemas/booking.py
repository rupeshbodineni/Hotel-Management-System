from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class BookingBase(BaseModel):
    customer_name: str
    customer_email: str
    room_id: int
    check_in_date: date
    check_out_date: date
    total_amount: float

class BookingCreate(BookingBase):
    pass

class BookingResponse(BookingBase):
    booking_id: int
    booking_status: str

    class Config:
        from_attributes = True