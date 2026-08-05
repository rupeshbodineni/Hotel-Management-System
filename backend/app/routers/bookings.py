from datetime import date, datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.database.connection import get_db
from app.models.booking import Booking
from app.models.room import Room
from app.models.coupon import Coupon
from app.models.user import User
from app.models.notification import Notification
from app.schemas.booking import BookingCreate, BookingResponse
from app.utils.jwt_handler import get_current_user, SECRET_KEY, ALGORITHM

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)

# Helper function to check availability
def is_room_available(room_id: int, check_in: date, check_out: date, db: Session, exclude_booking_id: Optional[int] = None):
    query = db.query(Booking).filter(
        Booking.room_id == room_id,
        Booking.status.notin_(["cancelled", "rejected"]),
        Booking.check_in < check_out,
        Booking.check_out > check_in
    )
    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)
    existing_booking = query.first()
    return existing_booking is None


@router.post("/check-availability")
def check_availability(
    room_id: int,
    check_in: date,
    check_out: date,
    db: Session = Depends(get_db)
):
    if check_out <= check_in:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")
    available = is_room_available(room_id, check_in, check_out, db)
    return {"available": available}


@router.post("/", response_model=BookingResponse, status_code=201)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    # Determine user_id if token is present
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            payload_jwt = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user = db.query(User).filter(User.email == payload_jwt.get("sub")).first()
            if user:
                user_id = user.id
        except JWTError:
            pass

    room = db.query(Room).filter(Room.id == payload.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    check_in = payload.check_in or date.today()
    check_out = payload.check_out or (check_in + timedelta(days=1))
    if check_out <= check_in:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")

    # Availability check
    if not is_room_available(payload.room_id, check_in, check_out, db):
        raise HTTPException(status_code=400, detail="Room is not available for these dates")

    # Base cost calculation
    days = max((check_out - check_in).days, 1)
    base_cost = room.price * days

    # Apply discount from Room first if any
    if room.discount > 0:
        base_cost = base_cost * (1 - room.discount / 100)

    # Apply Coupon
    discount_amount = 0.0
    if payload.coupon_code:
        coupon = db.query(Coupon).filter(
            Coupon.code == payload.coupon_code,
            Coupon.is_active == True,
            Coupon.valid_until >= date.today()
        ).first()
        if coupon:
            discount_amount = base_cost * (coupon.discount_percent / 100)
            base_cost = max(base_cost - discount_amount, 0.0)
        else:
            raise HTTPException(status_code=400, detail="Invalid or expired coupon code")

    booking = Booking(
        user_id=user_id,
        room_id=payload.room_id,
        customer_name=payload.customer_name or "Guest",
        customer_email=payload.customer_email or "guest@example.com",
        check_in=check_in,
        check_out=check_out,
        guests=payload.guests or 2,
        coupon_code=payload.coupon_code,
        discount_amount=discount_amount,
        total_amount=base_cost,
        status="pending"
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Add notification for user
    if user_id:
        notif = Notification(
            user_id=user_id,
            message=f"Booking request for Room {room.room_number} submitted. Status: pending.",
            notification_type="booking"
        )
        db.add(notif)
        db.commit()

    # Log mock notification to terminal
    print(f"============================================================")
    print(f"[SMTP EMAIL MOCK] Booking Confirmation Request for {booking.customer_name}")
    print(f"Room: {room.room_number}, Dates: {booking.check_in} to {booking.check_out}")
    print(f"============================================================")

    return booking


@router.get("/my", response_model=List[BookingResponse])
def get_my_bookings(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == current_user.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return db.query(Booking).filter(Booking.user_id == user.id).all()


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
    booking.guests = payload.guests or booking.guests
    if booking.check_out <= booking.check_in:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")

    # Date conflict check
    if not is_room_available(booking.room_id, booking.check_in, booking.check_out, db, exclude_booking_id=booking_id):
        raise HTTPException(status_code=400, detail="Room is not available for these dates")

    booking.total_amount = payload.total_amount if payload.total_amount is not None else booking.total_amount

    db.commit()
    db.refresh(booking)
    return booking


@router.patch("/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    status: str,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    # Validate status values
    valid_statuses = ["pending", "confirmed", "checked_in", "checked_out", "cancelled", "rejected"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status value")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = status

    # If user checks out, release/make the room available
    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if room:
        if status == "checked_in":
            room.status = "occupied"
        elif status == "checked_out":
            room.status = "dirty" # Housekeeping will clean it
        elif status in ["cancelled", "rejected"]:
            room.status = "available"

    db.commit()

    if booking.user_id:
        notif = Notification(
            user_id=booking.user_id,
            message=f"Your booking status has been updated to: {status}.",
            notification_type="booking"
        )
        db.add(notif)
        db.commit()

    # Log emails mock to terminal
    print(f"============================================================")
    print(f"[SMTP EMAIL MOCK] Sending status update email to {booking.customer_email}")
    print(f"Booking ID: {booking.id}, Status: {status.upper()}")
    print(f"============================================================")

    return {"message": "Status updated successfully", "status": status}


@router.delete("/{booking_id}")
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    db.delete(booking)
    db.commit()
    return {"message": "Booking deleted"}
