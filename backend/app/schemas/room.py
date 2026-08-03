from pydantic import BaseModel

class RoomCreate(BaseModel):
    room_number: str
    room_type: str
    price: float

class RoomResponse(RoomCreate):
    id: int
    status: str

    class Config:
        from_attributes = True
