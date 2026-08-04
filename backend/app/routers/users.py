from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database.connection import get_db
from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.password import hash_password, verify_password
from app.utils.jwt_handler import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

class ProfileUpdateSchema(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    photo: Optional[str] = None
    preferences: Optional[str] = None

class PasswordChangeSchema(BaseModel):
    old_password: str
    new_password: str

@router.post("/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password),
        role="customer" # default to customer on standard user router
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User Created",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
        },
    }


@router.get("/")
def get_users(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "phone": u.phone,
            "address": u.address
        }
        for u in users
    ]


@router.put("/profile")
def update_profile(
    payload: ProfileUpdateSchema,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == current_user.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.name is not None:
        user.name = payload.name
    if payload.phone is not None:
        user.phone = payload.phone
    if payload.address is not None:
        user.address = payload.address
    if payload.photo is not None:
        user.photo = payload.photo
    if payload.preferences is not None:
        user.preferences = payload.preferences

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "photo": user.photo,
            "preferences": user.preferences
        }
    }


@router.put("/change-password")
def change_password(
    payload: PasswordChangeSchema,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == current_user.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(payload.old_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()

    return {"message": "Password changed successfully"}