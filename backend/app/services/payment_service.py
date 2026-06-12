from sqlalchemy.orm import Session
from models.payment import Payment
from datetime import datetime

def make_payment(db: Session, payment_data):

    payment = Payment(
        booking_id=payment_data.booking_id,
        amount=payment_data.amount,
        payment_method=payment_data.payment_method,
        payment_status="Success",
        payment_date=datetime.utcnow()
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return payment

def get_all_payments(db: Session):
    return db.query(Payment).all()

def get_payment_by_id(db: Session, payment_id: int):

    return db.query(Payment).filter( Payment.payment_id == payment_id ).first()