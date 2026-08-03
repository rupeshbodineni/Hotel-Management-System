from datetime import date
from typing import Optional
from pydantic import BaseModel

class BookingCreate(BaseModel):
    room_id: int
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    check_in: Optional[date] = None
    check_out: Optional[date] = None
    total_amount: Optional[float] = None

class BookingResponse(BaseModel):
    id: int
    room_id: int
    customer_name: str
    customer_email: str
    check_in: date
    check_out: date
    total_amount: float
    status: str

    class Config:
        from_attributes = True
