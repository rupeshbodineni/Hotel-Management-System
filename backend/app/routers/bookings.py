from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)

# -------------------------
# Schema (Model)
# -------------------------
class Booking(BaseModel):
    id: int
    user_name: str
    room_number: str
    check_in: str
    check_out: str


# -------------------------
# In-memory storage
# -------------------------
bookings: List[Booking] = []


# -------------------------
# CREATE booking
# -------------------------
@router.post("/", response_model=Booking)
def create_booking(booking: Booking):
    # check duplicate ID
    for b in bookings:
        if b.id == booking.id:
            raise HTTPException(status_code=400, detail="Booking ID already exists")

    bookings.append(booking)
    return booking


# -------------------------
# READ all bookings
# -------------------------
@router.get("/", response_model=List[Booking])
def get_bookings():
    return bookings


# -------------------------
# READ single booking
# -------------------------
@router.get("/{booking_id}", response_model=Booking)
def get_booking(booking_id: int):
    for b in bookings:
        if b.id == booking_id:
            return b

    raise HTTPException(status_code=404, detail="Booking not found")


# -------------------------
# UPDATE booking
# -------------------------
@router.put("/{booking_id}", response_model=Booking)
def update_booking(booking_id: int, updated: Booking):
    for index, b in enumerate(bookings):
        if b.id == booking_id:
            bookings[index] = updated
            return updated

    raise HTTPException(status_code=404, detail="Booking not found")


# -------------------------
# DELETE booking
# -------------------------
@router.delete("/{booking_id}")
def delete_booking(booking_id: int):
    for index, b in enumerate(bookings):
        if b.id == booking_id:
            bookings.pop(index)
            return {"message": "Booking deleted"}

    raise HTTPException(status_code=404, detail="Booking not found")