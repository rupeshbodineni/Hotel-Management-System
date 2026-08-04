import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.staff import Staff
from app.models.user import User
from app.schemas.staff import StaffCreate, StaffResponse, AttendanceLogSchema, ShiftUpdateSchema
from app.utils.jwt_handler import get_current_user
from app.utils.password import hash_password

router = APIRouter(
    prefix="/staff",
    tags=["Staff"]
)

@router.get("/")
def get_all_staff(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    staff_members = db.query(Staff).all()
    results = []
    for s in staff_members:
        results.append({
            "id": s.id,
            "user_id": s.user_id,
            "name": s.user.name if s.user else "Deleted User",
            "email": s.user.email if s.user else "N/A",
            "role": s.user.role if s.user else "N/A",
            "department": s.department,
            "salary": s.salary,
            "shift": s.shift,
            "attendance": json.loads(s.attendance) if s.attendance else [],
            "performance": s.performance,
            "leave_balance": s.leave_balance
        })
    return results


@router.post("/", status_code=201)
def add_staff(
    payload: StaffCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if user exists
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found for this user_id")

    # Check if staff already exists
    existing = db.query(Staff).filter(Staff.user_id == payload.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Staff record already exists for this user")

    new_staff = Staff(
        user_id=payload.user_id,
        department=payload.department,
        salary=payload.salary,
        shift=payload.shift,
        attendance="[]"
    )
    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)

    return {"message": "Staff details added successfully", "staff_id": new_staff.id}


@router.patch("/{staff_id}/shift")
def update_shift(
    staff_id: int,
    payload: ShiftUpdateSchema,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff record not found")

    staff.shift = payload.shift
    db.commit()
    return {"message": "Shift updated successfully", "shift": staff.shift}


@router.post("/{staff_id}/attendance")
def log_attendance(
    staff_id: int,
    payload: AttendanceLogSchema,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Receptionist, manager, or admin can mark attendance
    if current_user.get("role") not in ["admin", "manager", "receptionist", "staff"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff record not found")

    dates = json.loads(staff.attendance) if staff.attendance else []
    if payload.date not in dates:
        dates.append(payload.date)
        staff.attendance = json.dumps(dates)
        db.commit()
        return {"message": "Attendance logged", "dates": dates}
    else:
        return {"message": "Attendance already logged for this date", "dates": dates}


@router.patch("/{staff_id}/performance")
def update_performance(
    staff_id: int,
    performance: str,
    leave_delta: Optional[int] = 0,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff record not found")

    staff.performance = performance
    if leave_delta:
        staff.leave_balance = max(staff.leave_balance + leave_delta, 0)
        
    db.commit()
    return {"message": "Staff performance updated successfully", "performance": staff.performance, "leave_balance": staff.leave_balance}


@router.delete("/{staff_id}")
def delete_staff(
    staff_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff record not found")

    db.delete(staff)
    db.commit()
    return {"message": "Staff record deleted successfully"}
