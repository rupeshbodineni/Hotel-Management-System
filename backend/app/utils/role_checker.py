from fastapi import HTTPException, status

ALLOWED_ROLES = ["admin", "staff", "user"]


def check_role(user_role: str, allowed_roles: list):
    if user_role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource"
        )
    return True


def is_admin(user_role: str):
    return check_role(user_role, ["admin"])


def is_staff(user_role: str):
    return check_role(user_role, ["admin", "staff"])


def is_user(user_role: str):
    return check_role(user_role, ["admin", "staff", "user"])