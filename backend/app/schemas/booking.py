from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel

class BookingCreate(BaseModel):
    room_id: int
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    check_in: Optional[date] = None
    check_out: Optional[date] = None
    guests: Optional[int] = 2
    coupon_code: Optional[str] = None
    discount_amount: Optional[float] = 0.0
    total_amount: Optional[float] = None

class BookingResponse(BaseModel):
    id: int
    room_id: int
    customer_name: str
    customer_email: str
    check_in: date
    check_out: date
    guests: int
    coupon_code: Optional[str] = None
    discount_amount: float
    total_amount: float
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
