from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)

class Payment(BaseModel):
    id: int
    booking_id: int
    amount: float
    method: str  
    status: str  

payments: List[Payment] = []

@router.post("/", response_model=Payment)
def create_payment(payment: Payment):
    for p in payments:
        if p.id == payment.id:
            raise HTTPException(status_code=400, detail="Payment ID already exists")
    payments.append(payment)
    return payment

@router.get("/", response_model=List[Payment])
def get_payments():
    return payments

@router.get("/{payment_id}", response_model=Payment)
def get_payment(payment_id: int):
    for p in payments:
        if p.id == payment_id:
            return p
    raise HTTPException(status_code=404, detail="Payment not found")

@router.put("/{payment_id}", response_model=Payment)
def update_payment(payment_id: int, updated: Payment):
    for index, p in enumerate(payments):
        if p.id == payment_id:
            payments[index] = updated
            return updated
    raise HTTPException(status_code=404, detail="Payment not found")

@router.delete("/{payment_id}")
def delete_payment(payment_id: int):
    for index, p in enumerate(payments):
        if p.id == payment_id:
            payments.pop(index)
            return {"message": "Payment deleted"}

    raise HTTPException(status_code=404, detail="Payment not found")