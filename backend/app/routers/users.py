from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.password import hash_password

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post("/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):

    print("Password =", user.password)
    print("Length =", len(user.password))

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User Created"}


@router.get("/")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()

    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email
        }
        for u in users
    ]