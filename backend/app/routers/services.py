from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.database.connection import get_db
from app.models.service import Service
from app.models.service_booking import ServiceBooking
from app.models.user import User
from app.schemas.service import ServiceCreate, ServiceResponse
from app.schemas.service_booking import ServiceBookingCreate, ServiceBookingResponse
from app.utils.jwt_handler import get_current_user, SECRET_KEY, ALGORITHM

router = APIRouter(
    prefix="/services",
    tags=["Services"]
)

# Endpoints for Services
@router.post("/", response_model=ServiceResponse, status_code=201)
def create_service(
    payload: ServiceCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    new_service = Service(**payload.dict())
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service


@router.get("/", response_model=List[ServiceResponse])
def get_services(db: Session = Depends(get_db)):
    services = db.query(Service).all()
    # If empty, return a defaulted list (or we will seed them anyway)
    return services


# Booking of Services
@router.post("/book", response_model=ServiceBookingResponse, status_code=201)
def book_service(
    payload: ServiceBookingCreate,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
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

    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required to book services")

    service = db.query(Service).filter(Service.id == payload.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    new_booking = ServiceBooking(
        user_id=user_id,
        service_id=payload.service_id,
        booking_date=payload.booking_date,
        status="confirmed"
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return new_booking


@router.get("/bookings/my", response_model=List[ServiceBookingResponse])
def get_my_bookings(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == current_user.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return db.query(ServiceBooking).filter(ServiceBooking.user_id == user.id).all()


@router.get("/bookings/all", response_model=List[ServiceBookingResponse])
def get_all_bookings(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "manager", "receptionist", "staff"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    return db.query(ServiceBooking).all()


@router.patch("/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    status: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "manager", "receptionist", "staff"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    booking = db.query(ServiceBooking).filter(ServiceBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Service booking not found")

    booking.status = status
    db.commit()
    return {"message": "Booking status updated successfully", "status": status}
