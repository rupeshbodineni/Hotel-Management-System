from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.database.connection import get_db
from app.models.review import Review
from app.models.user import User
from app.models.room import Room
from app.schemas.review import ReviewCreate, ReviewResponse
from app.utils.jwt_handler import get_current_user, SECRET_KEY, ALGORITHM

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)

@router.post("/", response_model=ReviewResponse, status_code=201)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    # Determine user_id if token is present
    user_id = None
    user_name = "Anonymous Guest"
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            payload_jwt = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user = db.query(User).filter(User.email == payload_jwt.get("sub")).first()
            if user:
                user_id = user.id
                user_name = user.name
        except JWTError:
            pass

    room = db.query(Room).filter(Room.id == payload.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    new_review = Review(
        user_id=user_id,
        room_id=payload.room_id,
        rating=payload.rating,
        comment=payload.comment,
        is_approved=False # Admin must approve first
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    # Return structured details including guest/user name
    response_data = ReviewResponse(
        id=new_review.id,
        room_id=new_review.room_id,
        rating=new_review.rating,
        comment=new_review.comment,
        user_id=new_review.user_id,
        is_approved=new_review.is_approved,
        created_at=new_review.created_at,
        user_name=user_name
    )
    return response_data


@router.get("/", response_model=List[ReviewResponse])
def get_approved_reviews(db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.is_approved == True).all()
    out = []
    for r in reviews:
        uname = "Anonymous Guest"
        if r.user:
            uname = r.user.name
        out.append(ReviewResponse(
            id=r.id,
            room_id=r.room_id,
            rating=r.rating,
            comment=r.comment,
            user_id=r.user_id,
            is_approved=r.is_approved,
            created_at=r.created_at,
            user_name=uname
        ))
    return out


@router.get("/pending", response_model=List[ReviewResponse])
def get_pending_reviews(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    reviews = db.query(Review).filter(Review.is_approved == False).all()
    out = []
    for r in reviews:
        uname = "Anonymous Guest"
        if r.user:
            uname = r.user.name
        out.append(ReviewResponse(
            id=r.id,
            room_id=r.room_id,
            rating=r.rating,
            comment=r.comment,
            user_id=r.user_id,
            is_approved=r.is_approved,
            created_at=r.created_at,
            user_name=uname
        ))
    return out


@router.put("/{review_id}/approve")
def approve_review(
    review_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review.is_approved = True
    db.commit()
    return {"message": "Review approved successfully"}


@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    db.delete(review)
    db.commit()
    return {"message": "Review deleted"}
