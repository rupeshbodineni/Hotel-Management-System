from fastapi import APIRouter
from sqlalchemy.orm import Session
from fastapi import Depends

from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.password import hash_password

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post("/")
def create_user(
    user:UserCreate,
    db:Session=Depends(get_db)
):
    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message":"User Created",
        "data":new_user
    }

@router.get("/")
def get_users(
    db:Session=Depends(get_db)
):
    return db.query(User).all()

