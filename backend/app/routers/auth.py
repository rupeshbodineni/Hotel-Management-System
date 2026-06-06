from fastapi import APIRouter

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.get("/")
def auth_home():
    return {"message": "Auth Working"}


@router.post("/register")
def register_user():
    return {"message": "User registered "}


@router.post("/login")
def login_user():
    return {"message": "User logged in "}