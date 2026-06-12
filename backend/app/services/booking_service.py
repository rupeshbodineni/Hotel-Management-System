from sqlalchemy.orm import Session
from models.booking import Booking


def create_booking(db: Session, booking_data):
    booking = Booking(
        customer_name=booking_data.customer_name,
        customer_email=booking_data.customer_email,
        room_id=booking_data.room_id,
        check_in_date=booking_data.check_in_date,
        check_out_date=booking_data.check_out_date,
        total_amount=booking_data.total_amount,
        booking_status="Confirmed"
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking


def get_all_bookings(db: Session):
    return db.query(Booking).all()


def get_booking_by_id(db: Session, booking_id: int):
    return db.query(Booking).filter(
        Booking.booking_id == booking_id
    ).first()


def cancel_booking(db: Session, booking_id: int):

    booking = db.query(Booking).filter(
        Booking.booking_id == booking_id
    ).first()

    if not booking:
        return None

    booking.booking_status = "Cancelled"

    db.commit()
    db.refresh(booking)

    return booking