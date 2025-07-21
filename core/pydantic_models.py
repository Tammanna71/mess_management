from pydantic import BaseModel, EmailStr, validator, root_validator
from typing import Optional
from decimal import Decimal
from datetime import date


def not_empty(value: str, field: str) -> str:
    if not value.strip():
        raise ValueError(f"{field} cannot be empty or null")
    return value


# ---------- USER ----------
class UserPydantic(BaseModel):
    name: str
    phone: str
    email: EmailStr
    roll_no: Optional[str]
    room_no: Optional[str]
    is_active: Optional[bool] = True
    is_staff: Optional[bool] = False
    is_superuser: Optional[bool] = False

    _validate_name = validator("name", allow_reuse=True)(lambda v: not_empty(v, "Name"))
    _validate_phone = validator("phone", allow_reuse=True)(lambda v: not_empty(v, "Phone"))

    class Config:
        orm_mode = True


# ---------- MESS ----------
class MessPydantic(BaseModel):
    name: str
    location: str
    admin: Optional[str]
    bookings: Optional[int]
    menu: Optional[str]

    _validate_name = validator("name", allow_reuse=True)(lambda v: not_empty(v, "Mess name"))
    _validate_location = validator("location", allow_reuse=True)(lambda v: not_empty(v, "Location"))

    class Config:
        orm_mode = True


# ---------- MEAL TYPE ----------
class MealTypePydantic(BaseModel):
    mess_id: int
    type: str
    available: Optional[bool] = True
    session_time: Decimal
    delayed: Optional[bool] = False
    delay_minutes: Optional[int] = None
    reserve_meal: Optional[bool] = False

    _validate_type = validator("type", allow_reuse=True)(lambda v: not_empty(v, "Meal type"))

    class Config:
        orm_mode = True


# ---------- COUPON ----------
class CouponPydantic(BaseModel):
    user_id: int
    mess_id: int
    session_time: Decimal
    location: str
    cancelled: Optional[bool] = False
    created_by: str
    meal_type: str

    _validate_location = validator("location", allow_reuse=True)(lambda v: not_empty(v, "Location"))
    _validate_created_by = validator("created_by", allow_reuse=True)(lambda v: not_empty(v, "Created by"))
    _validate_meal_type = validator("meal_type", allow_reuse=True)(lambda v: not_empty(v, "Meal type"))

    class Config:
        orm_mode = True


# ---------- FEEDBACK ----------
class FeedbackPydantic(BaseModel):
    user_id: int
    mess_id: int
    text: str

    _validate_text = validator("text", allow_reuse=True)(lambda v: not_empty(v, "Feedback"))

    class Config:
        orm_mode = True


# ---------- NOTIFICATION ----------
class NotificationPydantic(BaseModel):
    user_id: int
    message: str

    _validate_message = validator("message", allow_reuse=True)(lambda v: not_empty(v, "Message"))

    class Config:
        orm_mode = True


# ---------- ATTENDANCE ----------
class AttendancePydantic(BaseModel):
    user_id: int
    mess_id: int
    date: date
    present: bool

    class Config:
        orm_mode = True


# ---------- BOOKING ----------
class BookingPydantic(BaseModel):
    user_id: int
    mess_id: int
    meal_type: str
    session_time: Decimal

    _validate_meal_type = validator("meal_type", allow_reuse=True)(lambda v: not_empty(v, "Meal type"))

    class Config:
        orm_mode = True


# ---------- AUDIT LOG ----------
class AuditLogPydantic(BaseModel):
    action: str
    performed_by: int
    details: str

    _validate_action = validator("action", allow_reuse=True)(lambda v: not_empty(v, "Action"))
    _validate_details = validator("details", allow_reuse=True)(lambda v: not_empty(v, "Details"))

    class Config:
        orm_mode = True
