from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime

def not_empty_string(value: str, field: str) -> str:
    if not value.strip():
        raise ValueError(f"{field} cannot be empty")
    return value

class UserPydantic(BaseModel):
    name: str
    phone: str
    email: EmailStr
    roll_no: Optional[str]
    room_no: Optional[str]
    is_active: Optional[bool] = True
    is_staff: Optional[bool] = False
    is_superuser: Optional[bool] = False

    _validate_name = validator("name", allow_reuse=True)(lambda v: not_empty_string(v, "name"))
    _validate_phone = validator("phone", allow_reuse=True)(lambda v: not_empty_string(v, "phone"))

class MessPydantic(BaseModel):
    name: str
    location: str
    admin: Optional[str]
    bookings: Optional[int]
    menu: Optional[str]

    _validate_name = validator("name", allow_reuse=True)(lambda v: not_empty_string(v, "name"))
    _validate_location = validator("location", allow_reuse=True)(lambda v: not_empty_string(v, "location"))

class CouponPydantic(BaseModel):
    user_id: int
    mess_id: int
    session_time: float
    location: str
    cancelled: Optional[bool] = False
    created_by: str
    meal_type: str

    _validate_location = validator("location", allow_reuse=True)(lambda v: not_empty_string(v, "location"))
    _validate_created_by = validator("created_by", allow_reuse=True)(lambda v: not_empty_string(v, "created_by"))
    _validate_meal_type = validator("meal_type", allow_reuse=True)(lambda v: not_empty_string(v, "meal_type"))

class MealTypePydantic(BaseModel):
    mess_id: int
    type: str
    available: Optional[bool] = True
    session_time: float
    delayed: Optional[bool] = False
    delay_minutes: Optional[int]
    reserve_meal: Optional[bool] = False

    _validate_type = validator("type", allow_reuse=True)(lambda v: not_empty_string(v, "type"))

class FeedbackPydantic(BaseModel):
    user_id: int
    result: str
    issued_to: str

    _validate_result = validator("result", allow_reuse=True)(lambda v: not_empty_string(v, "result"))
    _validate_issued_to = validator("issued_to", allow_reuse=True)(lambda v: not_empty_string(v, "issued_to"))

class BookingPydantic(BaseModel):
    user_id: int
    meal_slot_id: int

class NotificationPydantic(BaseModel):
    title: str
    message: str

    _validate_title = validator("title", allow_reuse=True)(lambda v: not_empty_string(v, "title"))
    _validate_message = validator("message", allow_reuse=True)(lambda v: not_empty_string(v, "message"))

class AuditLogPydantic(BaseModel):
    action: str
    performed_by: int
    details: str

    _validate_action = validator("action", allow_reuse=True)(lambda v: not_empty_string(v, "action"))
    _validate_details = validator("details", allow_reuse=True)(lambda v: not_empty_string(v, "details"))
