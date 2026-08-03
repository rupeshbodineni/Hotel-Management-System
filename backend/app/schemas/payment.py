from datetime import datetime
from pydantic import BaseModel

class PaymentBase(BaseModel):
    booking_id: int
    amount: float
    payment_method: str

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: int
    payment_status: str
    payment_date: datetime

    class Config:
        from_attributes = True
