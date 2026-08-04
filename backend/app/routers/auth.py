from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.schemas.auth import RegisterSchema, LoginSchema, TokenResponse

from app.utils.password import (
    hash_password,
    verify_password
)

from app.utils.jwt_handler import (
    create_access_token,
    get_current_user
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.get("/")
def auth_home():
    return {"message": "Auth Working"}


@router.post("/register", status_code=201)
def register_user(
    payload: RegisterSchema,
    db: Session = Depends(get_db)
):
    existing = (
        db.query(User)
        .filter(User.email == payload.email)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(
            payload.password
        ),
        role=payload.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    }


@router.post(
    "/login",
    response_model=TokenResponse
)
def login_user(
    payload: LoginSchema,
    response: Response,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == payload.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        payload.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        {
            "sub": user.email,
            "role": user.role
        }
    )

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=3600
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "name": user.name
    }


@router.post("/logout")
def logout_user(response: Response):
    response.delete_cookie("access_token")

    return {
        "message": "Logged out successfully"
    }


from app.schemas.auth import RegisterSchema, LoginSchema, TokenResponse, ForgotPasswordSchema, ResetPasswordSchema

@router.get("/me")
def get_me(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch the actual user details from DB to return complete info (phone, address, photo, role, preferences)
    user = db.query(User).filter(User.email == current_user.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "phone": user.phone,
        "address": user.address,
        "photo": user.photo,
        "preferences": user.preferences,
        "created_at": user.created_at
    }


@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordSchema,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Don't reveal user existence for security, but return success
        return {"message": "If the email exists, a reset link has been generated."}

    # Generate a temporary reset token (expires in 15 mins)
    reset_token = create_access_token({"sub": user.email, "type": "reset"})
    # Log the email / link to terminal for manual verification
    print(f"============================================================")
    print(f"[SMTP EMAIL MOCK] Sending Password Reset to {user.email}")
    print(f"Reset Link: http://localhost:5173/reset-password?token={reset_token}")
    print(f"============================================================")

    return {
        "message": "Password reset email sent (Mocked in server console)",
        "reset_token": reset_token
    }


@router.post("/reset-password")
def reset_password(
    payload: ResetPasswordSchema,
    db: Session = Depends(get_db)
):
    from jose import jwt, JWTError
    from app.utils.jwt_handler import SECRET_KEY, ALGORITHM

    try:
        data = jwt.decode(payload.token, SECRET_KEY, algorithms=[ALGORITHM])
        email = data.get("sub")
        if not email or data.get("type") != "reset":
            raise HTTPException(status_code=400, detail="Invalid token type")
    except JWTError:
        raise HTTPException(status_code=400, detail="Token is invalid or expired")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password reset successful"}