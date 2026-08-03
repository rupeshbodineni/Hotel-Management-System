from datetime import date, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.booking import Booking
from app.models.room import Room
from app.schemas.booking import BookingCreate, BookingResponse

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)

@router.post("/", response_model=BookingResponse, status_code=201)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db)
):
    room = db.query(Room).filter(Room.id == payload.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    check_in = payload.check_in or date.today()
    check_out = payload.check_out or (check_in + timedelta(days=1))
    if check_out <= check_in:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")

    total_amount = payload.total_amount
    if total_amount is None:
        total_amount = room.price * max((check_out - check_in).days, 1)

    booking = Booking(
        room_id=payload.room_id,
        customer_name=payload.customer_name or "Guest",
        customer_email=payload.customer_email or "guest@example.com",
        check_in=check_in,
        check_out=check_out,
        total_amount=total_amount,
        status="confirmed"
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/", response_model=List[BookingResponse])
def get_bookings(db: Session = Depends(get_db)):
    return db.query(Booking).all()


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking(
    booking_id: int,
    payload: BookingCreate,
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.customer_name = payload.customer_name or booking.customer_name
    booking.customer_email = payload.customer_email or booking.customer_email
    booking.check_in = payload.check_in or booking.check_in
    booking.check_out = payload.check_out or booking.check_out
    if booking.check_out <= booking.check_in:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")

    booking.total_amount = payload.total_amount if payload.total_amount is not None else booking.total_amount

    db.commit()
    db.refresh(booking)
    return booking


@router.delete("/{booking_id}")
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    db.delete(booking)
    db.commit()
    return {"message": "Booking deleted"}
