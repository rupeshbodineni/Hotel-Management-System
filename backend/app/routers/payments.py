from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)

# -------------------------
# Schema
# -------------------------
class Payment(BaseModel):
    id: int
    booking_id: int
    amount: float
    method: str   # card, cash, upi
    status: str   # success, pending, failed


# -------------------------
# In-memory storage
# -------------------------
payments: List[Payment] = []


# -------------------------
# CREATE payment
# -------------------------
@router.post("/", response_model=Payment)
def create_payment(payment: Payment):
    for p in payments:
        if p.id == payment.id:
            raise HTTPException(status_code=400, detail="Payment ID already exists")

    payments.append(payment)
    return payment


# -------------------------
# READ all payments
# -------------------------
@router.get("/", response_model=List[Payment])
def get_payments():
    return payments


# -------------------------
# READ single payment
# -------------------------
@router.get("/{payment_id}", response_model=Payment)
def get_payment(payment_id: int):
    for p in payments:
        if p.id == payment_id:
            return p

    raise HTTPException(status_code=404, detail="Payment not found")


# -------------------------
# UPDATE payment
# -------------------------
@router.put("/{payment_id}", response_model=Payment)
def update_payment(payment_id: int, updated: Payment):
    for index, p in enumerate(payments):
        if p.id == payment_id:
            payments[index] = updated
            return updated

    raise HTTPException(status_code=404, detail="Payment not found")


# -------------------------
# DELETE payment
# -------------------------
@router.delete("/{payment_id}")
def delete_payment(payment_id: int):
    for index, p in enumerate(payments):
        if p.id == payment_id:
            payments.pop(index)
            return {"message": "Payment deleted"}

    raise HTTPException(status_code=404, detail="Payment not found")