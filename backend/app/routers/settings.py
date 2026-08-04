from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.coupon import Coupon
from app.schemas.coupon import CouponCreate, CouponResponse
from app.utils.jwt_handler import get_current_user

router = APIRouter(
    prefix="/settings",
    tags=["Settings"]
)

HOTEL_INFO = {
    "name": "The Royal Antigravity Oasis",
    "logo": "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=150",
    "theme": "luxury-gold",
    "currency": "INR",
    "symbol": "₹",
    "tax_percent": 12.0,
    "languages": ["English", "Hindi", "French", "Spanish"]
}

@router.get("/")
def get_hotel_settings():
    return HOTEL_INFO


@router.get("/coupons", response_model=List[CouponResponse])
def get_all_coupons(db: Session = Depends(get_db)):
    return db.query(Coupon).all()


@router.post("/coupons", response_model=CouponResponse, status_code=201)
def create_coupon(
    payload: CouponCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    existing = db.query(Coupon).filter(Coupon.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")

    new_coupon = Coupon(**payload.dict())
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return new_coupon


@router.delete("/coupons/{coupon_id}")
def delete_coupon(
    coupon_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    db.delete(coupon)
    db.commit()
    return {"message": "Coupon deleted successfully"}
