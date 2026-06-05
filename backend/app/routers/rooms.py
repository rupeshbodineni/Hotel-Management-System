from fastapi import APIRouter
from sqlalchemy.orm import Session
from fastapi import Depends

from app.database.database import get_db
from app.models.room import Room
from app.schemas.room import RoomCreate

router = APIRouter(
    prefix="/rooms",
    tags=["Rooms"]
)

@router.post("/")
def create_room(
    room:RoomCreate,
    db:Session=Depends(get_db)
):
    new_room = Room(**room.dict())

    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    return new_room

@router.get("/")
def get_rooms(
    db:Session=Depends(get_db)
):
    return db.query(Room).all()