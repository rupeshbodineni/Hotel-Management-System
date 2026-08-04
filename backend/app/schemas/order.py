from datetime import date, datetime
from pydantic import BaseModel
from typing import Optional

class RestaurantOrderBase(BaseModel):
    room_number: Optional[str] = None
    items: Optional[str] = None
    total_amount: float
    order_type: str = "room_service"  # room_service or table_reservation
    reservation_date: Optional[date] = None
    reservation_time: Optional[str] = None

class RestaurantOrderCreate(RestaurantOrderBase):
    pass

class RestaurantOrderResponse(RestaurantOrderBase):
    id: int
    user_id: Optional[int] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
