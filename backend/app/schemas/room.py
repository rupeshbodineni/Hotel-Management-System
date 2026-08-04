from pydantic import BaseModel
from typing import Optional

class RoomCreate(BaseModel):
    room_number: str
    room_type: str
    price: float
    capacity: Optional[int] = 2
    floor_number: Optional[int] = 1
    discount: Optional[float] = 0.0
    is_featured: Optional[int] = 0
    description: Optional[str] = ""
    amenities: Optional[str] = ""
    image_url: Optional[str] = ""

class RoomResponse(RoomCreate):
    id: int
    status: str

    class Config:
        from_attributes = True
