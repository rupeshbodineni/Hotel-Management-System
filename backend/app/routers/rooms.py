from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.room import Room
from app.schemas.room import RoomCreate, RoomResponse

router = APIRouter(
    prefix="/rooms",
    tags=["Rooms"]
)

@router.post("/", response_model=RoomResponse, status_code=201)
def create_room(
    payload: RoomCreate,
    db: Session = Depends(get_db)
):
    existing_room = (
        db.query(Room)
        .filter(Room.room_number == payload.room_number)
        .first()
    )

    if existing_room:
        raise HTTPException(
            status_code=400,
            detail="Room already exists"
        )

    new_room = Room(**payload.dict())
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room


@router.get("/", response_model=List[RoomResponse])
def get_rooms(db: Session = Depends(get_db)):
    return db.query(Room).all()


@router.get("/{room_id}", response_model=RoomResponse)
def get_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@router.put("/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: int,
    payload: RoomCreate,
    db: Session = Depends(get_db)
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    for key, value in payload.dict().items():
        setattr(room, key, value)

    db.commit()
    db.refresh(room)
    return room


@router.delete("/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    db.delete(room)
    db.commit()
    return {"message": "Room deleted"}
