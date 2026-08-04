from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class InvoiceBase(BaseModel):
    booking_id: int
    invoice_number: str
    subtotal: float
    tax: float
    discount: float
    total: float
    status: str = "unpaid"

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceResponse(InvoiceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
