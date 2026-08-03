from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.booking import Booking
from app.models.payment import Payment
from app.schemas.payment import PaymentCreate, PaymentResponse

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)

@router.post("/", response_model=PaymentResponse, status_code=201)
def create_payment(
    payload: PaymentCreate,
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == payload.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    new_payment = Payment(
        booking_id=payload.booking_id,
        amount=payload.amount,
        payment_method=payload.payment_method,
        payment_status="success"
    )

    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    return new_payment


@router.get("/", response_model=List[PaymentResponse])
def get_payments(db: Session = Depends(get_db)):
    return db.query(Payment).all()


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@router.put("/{payment_id}", response_model=PaymentResponse)
def update_payment(
    payment_id: int,
    payload: PaymentCreate,
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    payment.booking_id = payload.booking_id
    payment.amount = payload.amount
    payment.payment_method = payload.payment_method
    payment.payment_status = "success"

    db.commit()
    db.refresh(payment)
    return payment


@router.delete("/{payment_id}")
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    db.delete(payment)
    db.commit()
    return {"message": "Payment deleted"}
