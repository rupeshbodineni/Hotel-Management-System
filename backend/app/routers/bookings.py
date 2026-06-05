from fastapi import APIRouter

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)

@router.get("/")
def get_bookings():
    return {
        "message":"All bookings"
    }