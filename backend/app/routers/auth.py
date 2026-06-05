from fastapi import APIRouter

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.get("/")
def auth_home():
    return {"message": "Auth Working"}

# TEMP: register (mock)
@router.post("/register")
def register_user():
    return {"message": "User registered "}

# TEMP: login (mock)
@router.post("/login")
def login_user():
    return {"message": "User logged in "}