from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
class PaymentBase(BaseModel):
    booking_id: int
    amount: float
    payment_method: str  


class PaymentCreate(PaymentBase):
    pass


class PaymentResponse(PaymentBase):
    payment_id: int
    payment_status: str
    payment_date: datetime

    class Config:
        from_attributes = True