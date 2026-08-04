from datetime import date
from pydantic import BaseModel

class CouponBase(BaseModel):
    code: str
    discount_percent: float
    valid_until: date
    is_active: bool = True

class CouponCreate(CouponBase):
    pass

class CouponResponse(CouponBase):
    id: int

    class Config:
        from_attributes = True
