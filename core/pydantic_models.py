from pydantic import BaseModel, validator, Field
from typing import Optional
from decimal import Decimal
from datetime import date
import re


def not_empty(value: str, field: str) -> str:
    """Enhanced empty value validation with better error handling."""
    if value is None:
        raise ValueError(f"{field} cannot be null")
    if not isinstance(value, str):
        raise ValueError(f"{field} must be a string")
    if not value.strip():
        raise ValueError(f"{field} cannot be empty or contain only whitespace")
    return value.strip()


def validate_email(email: str) -> str:
    """
    Comprehensive email validation with enhanced security and accuracy.
    """
    if not isinstance(email, str):
        raise ValueError("Email must be a string")
    
    email = email.strip().lower()
    
    # Basic length check
    if len(email) < 5 or len(email) > 254:
        raise ValueError("Email must be between 5 and 254 characters")
    
    # Check for valid email format using enhanced regex
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise ValueError("Invalid email format")
    
    # Check for common invalid patterns
    if email.startswith('.') or email.endswith('.'):
        raise ValueError("Email cannot start or end with a dot")
    
    if '..' in email:
        raise ValueError("Email cannot contain consecutive dots")
    
    # Split and validate local and domain parts
    try:
        local_part, domain = email.split('@')
    except ValueError:
        raise ValueError("Email must contain exactly one @ symbol")
    
    if len(local_part) < 1 or len(local_part) > 64:
        raise ValueError("Local part of email must be between 1 and 64 characters")
    
    if len(domain) < 1 or len(domain) > 253:
        raise ValueError("Domain part of email must be between 1 and 253 characters")
    
    # Check for invalid local part patterns
    if local_part.startswith('.') or local_part.endswith('.'):
        raise ValueError("Local part cannot start or end with a dot")
    
    if '..' in local_part:
        raise ValueError("Local part cannot contain consecutive dots")
    
    # Check for invalid domain patterns
    if domain.startswith('.') or domain.endswith('.'):
        raise ValueError("Domain cannot start or end with a dot")
    
    if '..' in domain:
        raise ValueError("Domain cannot contain consecutive dots")
    
    # Check for valid TLD (Top Level Domain)
    tld = domain.split('.')[-1]
    if len(tld) < 2:
        raise ValueError("Invalid top-level domain")
    
    # Enhanced disposable email domain blocking
    disposable_domains = {
        '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
        'yopmail.com', 'throwaway.email', 'temp-mail.org', 'fakeinbox.com',
        'sharklasers.com', 'getairmail.com', 'mailnesia.com', 'maildrop.cc',
        'mailmetrash.com', 'trashmail.com', 'spam4.me', 'bccto.me',
        'chacuo.net', 'dispostable.com', 'mailnull.com', 'tempr.email',
        'tmpmail.org', 'tmpeml.com', 'sharklasers.com', 'guerrillamailblock.com',
        'pokemail.net', 'spamspot.com', 'binkmail.com', 'bobmail.info',
        'chammy.info', 'devnullmail.com', 'letthemeatspam.com', 'mailin8r.com',
        'mailinator2.com', 'notmailinator.com', 'reallymymail.com', 'safetymail.info',
        'sendspamhere.com', 'sogetthis.com', 'spamhereplease.com', 'spamthisplease.com',
        'supergreatmail.com', 'suremail.info', 'thisisnotmyrealemail.com', 'tradermail.info',
        'veryrealemail.com', 'wh4f.org', 'whatpaas.com', 'wuzup.net',
        'zoemail.net', 'zoemail.org', 'spam.la', 'spam4.me', 'bccto.me'
    }
    
    if domain in disposable_domains:
        raise ValueError("Disposable email addresses are not allowed for security reasons")
    
    # Enhanced generic email pattern blocking
    invalid_patterns = [
        r'^test@', r'^admin@', r'^root@', r'^webmaster@', r'^postmaster@',
        r'^noreply@', r'^no-reply@', r'^donotreply@', r'^do-not-reply@',
        r'^info@', r'^contact@', r'^support@', r'^help@', r'^service@',
        r'^mail@', r'^email@', r'^user@', r'^demo@', r'^example@',
        r'^sample@', r'^temp@', r'^temporary@', r'^fake@', r'^dummy@'
    ]
    
    for pattern in invalid_patterns:
        if re.match(pattern, email):
            raise ValueError("Generic email addresses are not allowed")
    
    return email


def validate_phone_number(phone: str) -> str:
    """
    Enhanced phone number validation with better international support.
    """
    if not isinstance(phone, str):
        raise ValueError("Phone number must be a string")
    
    phone = phone.strip()
    
    # Remove all non-digit characters except +
    cleaned = re.sub(r'[^\d+]', '', phone)
    
    # Check if it starts with + (international format)
    if cleaned.startswith('+'):
        # International format: +[country code][number]
        # Minimum length: +1 + 7 digits = 8 characters
        # Maximum length: +999 + 15 digits = 19 characters
        if len(cleaned) < 8 or len(cleaned) > 19:
            raise ValueError("Invalid international phone number format")
        
        # Check if it has at least 7 digits after country code
        digits_after_plus = len(cleaned) - 1
        if digits_after_plus < 7:
            raise ValueError("Phone number too short for international format")
            
    else:
        # Local format (no country code)
        # Minimum 7 digits, maximum 15 digits
        if len(cleaned) < 7 or len(cleaned) > 15:
            raise ValueError("Phone number must be between 7 and 15 digits")
    
    # Enhanced pattern validation
    digits_only = cleaned.replace('+', '')
    
    # Check for all repeated digits
    if re.match(r'^(\d)\1{6,}$', digits_only):
        raise ValueError("Phone number cannot be all repeated digits")
    
    # Check for repeated patterns
    if re.match(r'^(\d{2})\1{3,}$', digits_only):
        raise ValueError("Phone number cannot be all repeated patterns")
    
    # Check for sequential digits
    if re.match(r'^1234567890$', digits_only) or re.match(r'^0987654321$', digits_only):
        raise ValueError("Phone number cannot be sequential digits")
    
    # Check for common invalid patterns
    invalid_patterns = [
        r'^0000000', r'^1111111', r'^2222222', r'^3333333', r'^4444444',
        r'^5555555', r'^6666666', r'^7777777', r'^8888888', r'^9999999'
    ]
    
    for pattern in invalid_patterns:
        if re.match(pattern, digits_only):
            raise ValueError("Phone number cannot be all repeated digits")
    
    return phone


def validate_roll_number(roll_no: str) -> str:
    """
    Enhanced roll number validation with better format checking.
    """
    if roll_no is None:
        return roll_no
    
    if not isinstance(roll_no, str):
        raise ValueError("Roll number must be a string")
    
    # Remove spaces and convert to uppercase
    cleaned = roll_no.strip().upper()
    
    if not cleaned:  # Allow empty roll numbers
        return cleaned
    
    # Check length (typically 3-15 characters)
    if len(cleaned) < 3 or len(cleaned) > 15:
        raise ValueError("Roll number must be between 3 and 15 characters")
    
    # Must contain at least one letter and one number
    if not re.search(r'[A-Z]', cleaned):
        raise ValueError("Roll number must contain at least one letter")
    
    if not re.search(r'\d', cleaned):
        raise ValueError("Roll number must contain at least one number")
    
    # Check for valid characters (letters, numbers, hyphens, underscores)
    if not re.match(r'^[A-Z0-9_-]+$', cleaned):
        raise ValueError("Roll number can only contain letters, numbers, hyphens, and underscores")
    
    # Check for common invalid patterns
    if re.match(r'^[A-Z]{1,2}\d{1,2}$', cleaned) and len(cleaned) < 4:
        raise ValueError("Roll number seems too short for the format")
    
    return cleaned


def validate_room_number(room_no: str) -> str:
    """
    Enhanced room number validation with better format checking.
    """
    if room_no is None:
        return room_no
    
    if not isinstance(room_no, str):
        raise ValueError("Room number must be a string")
    
    cleaned = room_no.strip().upper()
    
    if not cleaned:  # Allow empty room numbers
        return cleaned
    
    # Check length (typically 2-10 characters)
    if len(cleaned) < 2 or len(cleaned) > 10:
        raise ValueError("Room number must be between 2 and 10 characters")
    
    # Must contain at least one number
    if not re.search(r'\d', cleaned):
        raise ValueError("Room number must contain at least one number")
    
    # Check for valid characters (letters, numbers, hyphens, slashes)
    if not re.match(r'^[A-Z0-9/-]+$', cleaned):
        raise ValueError("Room number can only contain letters, numbers, hyphens, and slashes")
    
    # Check for reasonable room number patterns
    if re.match(r'^\d{1,3}$', cleaned):  # Simple numeric room
        room_num = int(cleaned)
        if room_num < 1 or room_num > 999:
            raise ValueError("Room number seems unreasonable")
    
    return cleaned


def validate_name(name: str) -> str:
    """
    Enhanced name validation with better international support.
    """
    if not isinstance(name, str):
        raise ValueError("Name must be a string")
    
    cleaned = name.strip()
    
    # Check length
    if len(cleaned) < 2 or len(cleaned) > 50:
        raise ValueError("Name must be between 2 and 50 characters")
    
    # Enhanced regex for international names (supports accented characters)
    if not re.match(r'^[A-Za-zÀ-ÿ\s\'-]+$', cleaned):
        raise ValueError("Name can only contain letters, spaces, hyphens, and apostrophes")
    
    # Must contain at least one letter
    if not re.search(r'[A-Za-zÀ-ÿ]', cleaned):
        raise ValueError("Name must contain at least one letter")
    
    # Check for excessive spaces or special characters
    if re.search(r'\s{2,}', cleaned):
        raise ValueError("Name cannot contain multiple consecutive spaces")
    
    if cleaned.count('-') > 2:
        raise ValueError("Name cannot contain more than 2 hyphens")
    
    if cleaned.count("'") > 2:
        raise ValueError("Name cannot contain more than 2 apostrophes")
    
    return cleaned.title()  # Convert to title case


def validate_session_time(time: Decimal) -> Decimal:
    """
    Enhanced session time validation with better precision handling.
    """
    if not isinstance(time, (int, float, Decimal)):
        raise ValueError("Session time must be a number")
    
    # Convert to Decimal for precise comparison
    time_decimal = Decimal(str(time))
    
    if time_decimal < 0 or time_decimal > Decimal('23.59'):
        raise ValueError("Session time must be between 0.00 and 23.59")
    
    # Check if minutes part is valid (0-59)
    hours = int(time_decimal)
    minutes = int((time_decimal - hours) * 100)
    
    if minutes > 59:
        raise ValueError("Minutes must be between 0 and 59")
    
    # Check for reasonable meal times (optional business logic)
    if hours < 5 or hours > 23:
        raise ValueError("Session time should be between 5:00 and 23:59 for meal services")
    
    return time_decimal


def validate_meal_type(meal_type: str) -> str:
    """
    Validate meal type with predefined options.
    """
    if not isinstance(meal_type, str):
        raise ValueError("Meal type must be a string")
    
    cleaned = meal_type.strip().title()
    
    valid_meal_types = {
        'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Brunch', 'Tea', 'Coffee'
    }
    
    if cleaned not in valid_meal_types:
        raise ValueError(f"Meal type must be one of: {', '.join(valid_meal_types)}")
    
    return cleaned


def validate_future_date(date_value: date) -> date:
    """
    Validate that date is not in the past for bookings.
    """
    if not isinstance(date_value, date):
        raise ValueError("Date must be a valid date")
    
    if date_value < date.today():
        raise ValueError("Date cannot be in the past")
    
    return date_value


# ---------- USER ----------
class UserPydantic(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, description="Full name of the user")
    phone: str = Field(..., description="Phone number in any valid format")
    email: str = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, description="User password")
    roll_no: Optional[str] = Field(None, max_length=15, description="Student roll number")
    room_no: Optional[str] = Field(None, max_length=10, description="Room number")
    is_active: Optional[bool] = Field(True, description="User account status")
    is_staff: Optional[bool] = Field(False, description="Staff privileges")
    is_superuser: Optional[bool] = Field(False, description="Superuser privileges")

    _validate_name = validator("name", allow_reuse=True)(validate_name)
    _validate_phone = validator("phone", allow_reuse=True)(validate_phone_number)
    _validate_email = validator("email", allow_reuse=True)(validate_email)
    _validate_roll_no = validator("roll_no", allow_reuse=True)(validate_roll_number)
    _validate_room_no = validator("room_no", allow_reuse=True)(validate_room_number)

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "phone": "+1-555-123-4567",
                "email": "john.doe@example.com",
                "roll_no": "CS2023001",
                "room_no": "A101"
            }
        }


# ---------- MESS ----------
class MessPydantic(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Mess name")
    location: str = Field(..., min_length=2, max_length=100, description="Mess location")
    admin: Optional[str] = Field(None, max_length=100, description="Mess administrator")
    bookings: Optional[int] = Field(None, ge=0, le=10000, description="Number of current bookings")
    menu: Optional[str] = Field(None, max_length=500, description="Menu description")

    _validate_name = validator("name", allow_reuse=True)(lambda v: not_empty(v, "Mess name"))
    _validate_location = validator("location", allow_reuse=True)(lambda v: not_empty(v, "Location"))

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "name": "Main Campus Mess",
                "location": "Block A, Ground Floor",
                "admin": "Mess Manager",
                "bookings": 150,
                "menu": "Vegetarian and Non-vegetarian options available"
            }
        }


# ---------- MEAL TYPE ----------
class MealTypePydantic(BaseModel):
    mess_id: int = Field(..., gt=0, description="Mess ID")
    type: str = Field(..., min_length=2, max_length=50, description="Meal type (Breakfast, Lunch, Dinner)")
    available: Optional[bool] = Field(True, description="Meal availability status")
    session_time: Decimal = Field(..., description="Meal session time (HH.MM format)")
    delayed: Optional[bool] = Field(False, description="Meal delay status")
    delay_minutes: Optional[int] = Field(None, ge=0, le=120, description="Delay in minutes")
    reserve_meal: Optional[bool] = Field(False, description="Reserve meal option")

    _validate_type = validator("type", allow_reuse=True)(validate_meal_type)
    _validate_session_time = validator("session_time", allow_reuse=True)(validate_session_time)

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "mess_id": 1,
                "type": "Breakfast",
                "available": True,
                "session_time": 8.30,
                "delayed": False,
                "delay_minutes": None,
                "reserve_meal": False
            }
        }


# ---------- COUPON ----------
class CouponPydantic(BaseModel):
    user_id: int = Field(..., gt=0, description="User ID")
    mess_id: int = Field(..., gt=0, description="Mess ID")
    session_time: Decimal = Field(..., description="Session time (HH.MM format)")
    location: str = Field(..., min_length=2, max_length=100, description="Coupon location")
    cancelled: Optional[bool] = Field(False, description="Coupon cancellation status")
    created_by: str = Field(..., min_length=2, max_length=100, description="Creator name")
    meal_type: str = Field(..., min_length=2, max_length=50, description="Meal type")

    _validate_location = validator("location", allow_reuse=True)(lambda v: not_empty(v, "Location"))
    _validate_created_by = validator("created_by", allow_reuse=True)(lambda v: not_empty(v, "Created by"))
    _validate_meal_type = validator("meal_type", allow_reuse=True)(validate_meal_type)
    _validate_session_time = validator("session_time", allow_reuse=True)(validate_session_time)

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "mess_id": 1,
                "session_time": 12.30,
                "location": "Block A Mess",
                "cancelled": False,
                "created_by": "Admin User",
                "meal_type": "Lunch"
            }
        }


# ---------- FEEDBACK ----------
class FeedbackPydantic(BaseModel):
    user_id: int = Field(..., gt=0, description="User ID")
    mess_id: int = Field(..., gt=0, description="Mess ID")
    text: str = Field(..., min_length=10, max_length=1000, description="Feedback text")

    _validate_text = validator("text", allow_reuse=True)(lambda v: not_empty(v, "Feedback"))

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "mess_id": 1,
                "text": "The food quality has improved significantly. Great variety in menu."
            }
        }


# ---------- NOTIFICATION ----------
class NotificationPydantic(BaseModel):
    user_id: int = Field(..., gt=0, description="User ID")
    message: str = Field(..., min_length=5, max_length=500, description="Notification message")

    _validate_message = validator("message", allow_reuse=True)(lambda v: not_empty(v, "Message"))

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "message": "Your meal booking for tomorrow has been confirmed."
            }
        }


# ---------- ATTENDANCE ----------
class AttendancePydantic(BaseModel):
    user_id: int = Field(..., gt=0, description="User ID")
    mess_id: int = Field(..., gt=0, description="Mess ID")
    attendance_date: date = Field(..., description="Attendance date")
    present: bool = Field(..., description="Attendance status")

    _validate_attendance_date = validator("attendance_date", allow_reuse=True)(validate_future_date)

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "mess_id": 1,
                "attendance_date": "2024-01-15",
                "present": True
            }
        }


# ---------- BOOKING ----------
class BookingPydantic(BaseModel):
    user_id: int = Field(..., gt=0, description="User ID")
    mess_id: int = Field(..., gt=0, description="Mess ID")
    meal_type: str = Field(..., min_length=2, max_length=50, description="Meal type")
    session_time: Decimal = Field(..., description="Session time (HH.MM format)")

    _validate_meal_type = validator("meal_type", allow_reuse=True)(validate_meal_type)
    _validate_session_time = validator("session_time", allow_reuse=True)(validate_session_time)

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "mess_id": 1,
                "meal_type": "Dinner",
                "session_time": 19.30
            }
        }


# ---------- AUDIT LOG ----------
class AuditLogPydantic(BaseModel):
    action: str = Field(..., min_length=2, max_length=255, description="Action performed")
    performed_by: int = Field(..., gt=0, description="User ID who performed the action")
    details: str = Field(..., min_length=5, max_length=1000, description="Action details")

    _validate_action = validator("action", allow_reuse=True)(lambda v: not_empty(v, "Action"))
    _validate_details = validator("details", allow_reuse=True)(lambda v: not_empty(v, "Details"))

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "action": "User Registration",
                "performed_by": 1,
                "details": "New user registered with email john.doe@example.com"
            }
        }
