from datetime import datetime
from pydantic import BaseModel

class NotificationBase(BaseModel):
    message: str
    notification_type: str = "booking"

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
