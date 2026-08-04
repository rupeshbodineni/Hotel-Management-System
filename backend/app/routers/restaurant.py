from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.database.connection import get_db
from app.models.order import RestaurantOrder
from app.models.user import User
from app.schemas.order import RestaurantOrderCreate, RestaurantOrderResponse
from app.utils.jwt_handler import get_current_user, SECRET_KEY, ALGORITHM

router = APIRouter(
    prefix="/restaurant",
    tags=["Restaurant"]
)

MENU_ITEMS = [
    {"id": 1, "name": "Truffle Garlic Bread", "category": "Appetizers", "price": 350.0, "image": "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=300"},
    {"id": 2, "name": "Creamy Wild Mushroom Soup", "category": "Appetizers", "price": 390.0, "image": "https://images.unsplash.com/photo-1547592165-e1d17fed6005?w=300"},
    {"id": 3, "name": "Pan-seared Atlantic Salmon", "category": "Main Course", "price": 1200.0, "image": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300"},
    {"id": 4, "name": "Prime Filet Mignon", "category": "Main Course", "price": 1800.0, "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=300"},
    {"id": 5, "name": "Saffron & Asparagus Risotto", "category": "Main Course", "price": 850.0, "image": "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=300"},
    {"id": 6, "name": "Royal Butter Chicken with Naan", "category": "Main Course", "price": 750.0, "image": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300"},
    {"id": 7, "name": "Classic Venetian Tiramisu", "category": "Desserts", "price": 450.0, "image": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300"},
    {"id": 8, "name": "Warm Valrhona Chocolate Lava Cake", "category": "Desserts", "price": 420.0, "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300"},
    {"id": 9, "name": "Royal Gold Elixir Mocktail", "category": "Drinks", "price": 350.0, "image": "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=300"},
]

@router.get("/menu")
def get_menu():
    return MENU_ITEMS


@router.post("/order", response_model=RestaurantOrderResponse, status_code=201)
def place_order(
    payload: RestaurantOrderCreate,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            payload_jwt = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user = db.query(User).filter(User.email == payload_jwt.get("sub")).first()
            if user:
                user_id = user.id
        except JWTError:
            pass

    new_order = RestaurantOrder(
        user_id=user_id,
        room_number=payload.room_number,
        items=payload.items,
        total_amount=payload.total_amount,
        order_type=payload.order_type,
        reservation_date=payload.reservation_date,
        reservation_time=payload.reservation_time,
        status="pending"
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order


@router.get("/orders/my", response_model=List[RestaurantOrderResponse])
def get_my_orders(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == current_user.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return db.query(RestaurantOrder).filter(RestaurantOrder.user_id == user.id).all()


@router.get("/orders/all", response_model=List[RestaurantOrderResponse])
def get_all_orders(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "manager", "receptionist", "staff"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    return db.query(RestaurantOrder).all()


@router.patch("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status: str,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "manager", "receptionist", "staff"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    order = db.query(RestaurantOrder).filter(RestaurantOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status
    db.commit()
    return {"message": "Order status updated successfully", "status": status}
