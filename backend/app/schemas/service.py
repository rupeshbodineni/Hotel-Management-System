from pydantic import BaseModel
from typing import Optional

class ServiceBase(BaseModel):
    name: str
    service_type: str  # spa, gym, laundry, pickup, event
    price: float
    description: Optional[str] = ""

class ServiceCreate(ServiceBase):
    pass

class ServiceResponse(ServiceBase):
    id: int

    class Config:
        from_attributes = True
