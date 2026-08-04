from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.database.connection import get_db
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.invoice import Invoice
from app.models.user import User
from app.models.notification import Notification
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.utils.jwt_handler import get_current_user, SECRET_KEY, ALGORITHM

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

    # Update Booking status
    booking.status = "confirmed"
    
    # Generate Invoice automatically
    invoice_num = f"INV-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{booking.id}"
    tax_amt = payload.amount * 0.12  # 12% luxury tax
    discount_amt = booking.discount_amount
    
    new_invoice = Invoice(
        booking_id=booking.id,
        invoice_number=invoice_num,
        subtotal=payload.amount - tax_amt,
        tax=tax_amt,
        discount=discount_amt,
        total=payload.amount,
        status="paid"
    )
    db.add(new_invoice)
    db.commit()

    if booking.user_id:
        # Create notification
        notif = Notification(
            user_id=booking.user_id,
            message=f"Payment of ₹{payload.amount} successful via {payload.payment_method.upper()}. Invoice {invoice_num} generated.",
            notification_type="payment"
        )
        db.add(notif)
        db.commit()

    # Log SMTP notification
    print(f"============================================================")
    print(f"[SMTP EMAIL MOCK] Payment Receipt for {booking.customer_name}")
    print(f"Invoice Number: {invoice_num}, Amount: ₹{payload.amount}")
    print(f"============================================================")

    return new_payment


@router.get("/", response_model=List[PaymentResponse])
def get_payments(db: Session = Depends(get_db)):
    return db.query(Payment).all()


@router.get("/my", response_model=List[PaymentResponse])
def get_my_payments(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == current_user.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return db.query(Payment).join(Booking).filter(Booking.user_id == user.id).all()


@router.get("/invoices/my")
def get_my_invoices(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == current_user.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    invoices = db.query(Invoice).join(Booking).filter(Booking.user_id == user.id).all()
    return [{
        "id": inv.id,
        "booking_id": inv.booking_id,
        "invoice_number": inv.invoice_number,
        "subtotal": inv.subtotal,
        "tax": inv.tax,
        "discount": inv.discount,
        "total": inv.total,
        "status": inv.status,
        "created_at": inv.created_at
    } for inv in invoices]


@router.get("/invoices/all")
def get_all_invoices(db: Session = Depends(get_db)):
    invoices = db.query(Invoice).all()
    return [{
        "id": inv.id,
        "booking_id": inv.booking_id,
        "invoice_number": inv.invoice_number,
        "subtotal": inv.subtotal,
        "tax": inv.tax,
        "discount": inv.discount,
        "total": inv.total,
        "status": inv.status,
        "created_at": inv.created_at
    } for inv in invoices]


@router.post("/{payment_id}/refund")
def refund_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    payment.payment_status = "refunded"
    
    # Cancel associated booking
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    if booking:
        booking.status = "cancelled"
        
        # Mark associated invoice as refunded
        invoice = db.query(Invoice).filter(Invoice.booking_id == booking.id).first()
        if invoice:
            invoice.status = "refunded"
            
        if booking.user_id:
            notif = Notification(
                user_id=booking.user_id,
                message=f"Refund of ₹{payment.amount} processed. Booking cancelled.",
                notification_type="payment"
            )
            db.add(notif)
            
    db.commit()
    return {"message": "Payment refunded successfully"}
