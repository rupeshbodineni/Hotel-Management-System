from pydantic import BaseModel
from typing import Optional, List

class StaffBase(BaseModel):
    user_id: int
    department: str
    salary: float
    shift: str = "morning"

class StaffCreate(StaffBase):
    pass

class StaffResponse(StaffBase):
    id: int
    attendance: str
    performance: Optional[str] = None
    leave_balance: int

    class Config:
        from_attributes = True

class AttendanceLogSchema(BaseModel):
    date: str  # YYYY-MM-DD

class ShiftUpdateSchema(BaseModel):
    shift: str
