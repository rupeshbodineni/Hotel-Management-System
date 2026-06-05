from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/rooms",
    tags=["Rooms"]
)

class Room(BaseModel):
    id: int
    room_number: str
    room_type: str
    price: float

rooms: List[Room] = []

@router.post("/", response_model=Room)
def create_room(room: Room):
    for r in rooms:
        if r.id == room.id:
            raise HTTPException(status_code=400, detail="Room already exists")
    rooms.append(room)
    return room

@router.get("/", response_model=List[Room])
def get_rooms():
    return rooms

@router.get("/{room_id}", response_model=Room)
def get_room(room_id: int):
    for r in rooms:
        if r.id == room_id:
            return r
    raise HTTPException(status_code=404, detail="Room not found")

@router.put("/{room_id}", response_model=Room)
def update_room(room_id: int, updated: Room):
    for i, r in enumerate(rooms):
        if r.id == room_id:
            rooms[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="Room not found")

@router.delete("/{room_id}")
def delete_room(room_id: int):
    for i, r in enumerate(rooms):
        if r.id == room_id:
            rooms.pop(i)
            return {"message": "Room deleted"}
    raise HTTPException(status_code=404, detail="Room not found")