from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional

class ReviewBase(BaseModel):
    room_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    user_id: Optional[int] = None
    is_approved: bool
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True
