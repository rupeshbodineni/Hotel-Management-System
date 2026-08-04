from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.room import Room
from app.models.room_image import RoomImage
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
def get_rooms(
    room_type: Optional[str] = None,
    capacity: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    status: Optional[str] = None,
    is_featured: Optional[int] = None,
    amenities: Optional[str] = None,
    sort_by: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Room)

    if room_type:
        query = query.filter(Room.room_type.ilike(f"%{room_type}%"))
    if capacity:
        query = query.filter(Room.capacity >= capacity)
    if min_price is not None:
        query = query.filter(Room.price >= min_price)
    if max_price is not None:
        query = query.filter(Room.price <= max_price)
    if status:
        query = query.filter(Room.status == status)
    if is_featured is not None:
        query = query.filter(Room.is_featured == is_featured)
    if amenities:
        # Search for rooms that have the specified amenity
        for am in amenities.split(","):
            query = query.filter(Room.amenities.ilike(f"%{am.strip()}%"))

    if sort_by == "price_asc":
        query = query.order_by(Room.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Room.price.desc())

    return query.all()


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

    # Delete room images first
    db.query(RoomImage).filter(RoomImage.room_id == room_id).delete()

    db.delete(room)
    db.commit()
    return {"message": "Room deleted"}


# Manage Room Images
@router.post("/{room_id}/images")
def upload_room_image(
    room_id: int,
    image_url: str, # For simplicity, client sends image_url.
    db: Session = Depends(get_db)
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    new_img = RoomImage(room_id=room_id, image_url=image_url)
    db.add(new_img)
    db.commit()
    db.refresh(new_img)
    return {"message": "Image added successfully", "image": {"id": new_img.id, "url": new_img.image_url}}


@router.get("/{room_id}/images")
def get_room_images(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    images = db.query(RoomImage).filter(RoomImage.room_id == room_id).all()
    return [{"id": img.id, "url": img.image_url} for img in images]
