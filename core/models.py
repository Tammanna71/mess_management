#session time datatype doesn't match
#mess_name should be taken from mess
# Complete Django app: models.py, serializers.py, views.py, urls.py

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from datetime import timedelta


class UserManager(BaseUserManager):
    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError("Phone number is required")

        is_admin = extra_fields.get('is_staff') or extra_fields.get('is_superuser')

    # Enforce roll_no for students only
        if not is_admin:
            if not extra_fields.get('roll_no'):
                raise ValueError("Roll number is required for students")
            # if not extra_fields.get('room_no'):
            #     raise ValueError("Room number is required for students")   #localites can also eat mess food

        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        return self.create_user(phone, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    user_id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    room_no = models.CharField(max_length=10, null=True, blank=True)
    phone = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=True)
    roll_no = models.CharField(max_length=20, unique=True, null=True, blank=True)
    password = models.CharField(max_length=130)
    last_login = models.DateTimeField(null=True, blank=True)

    # These are required for admin compatibility
    # Quick admin access & permission bypass
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    date_joined = models.DateTimeField(default=timezone.now)

    #instead of username it asks to enter phone number
    USERNAME_FIELD = 'phone'
    #required for creating superuser
    REQUIRED_FIELDS = ['email', 'name', 'roll_no']

    objects = UserManager()

    def __str__(self):
        return self.name

class Mess(models.Model):
    mess_id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100, null=True, blank=True)
    location = models.CharField(max_length=100, null=True, blank=True)
    availability = models.BooleanField(default=True)
    stock = models.IntegerField(null=True, blank=True)
    admin = models.CharField(max_length=100, null=True, blank=True)
    current_status = models.CharField(max_length=100, null=True, blank=True)
    bookings = models.IntegerField(null=True, blank=True)
    menu = models.CharField(max_length=255, null=True, blank=True)

class Coupon(models.Model):
    c_id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    mess = models.ForeignKey(Mess, on_delete=models.CASCADE)
    session_time = models.DecimalField(max_digits=5, decimal_places=2)
    location = models.CharField(max_length=100)
    cancelled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.CharField(max_length=100)
    meal_type = models.CharField(max_length=100)
    
    def __str__(self):
        return f"Coupon {self.c_id} - {self.user.name} - {self.meal_type}"


class Menu(models.Model):
    mess = models.ForeignKey(Mess, on_delete=models.CASCADE, related_name='menus')
    session_time = models.CharField(max_length=50)
    name = models.CharField(max_length=100, null=True, blank=True)
    location = models.CharField(max_length=100, null=True, blank=True)
    item = models.CharField(max_length=100)
    meal_type = models.CharField(max_length=100)

class MealType(models.Model):
    mess = models.ForeignKey(Mess, on_delete=models.CASCADE)
    type = models.CharField(max_length=50)
    available = models.BooleanField(default=True)
    session_time = models.DecimalField(max_digits=5, decimal_places=2)
    delayed = models.BooleanField(default=False)
    delay_minutes = models.PositiveIntegerField(null=True, blank=True)
    reserve_meal = models.BooleanField(default=False)

class Feedback(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    result = models.TextField()
    issued_to = models.CharField(max_length=100)

class MessItems(models.Model):
    mess = models.ForeignKey(Mess, on_delete=models.CASCADE)
    session_time = models.CharField(max_length=50)
    location = models.CharField(max_length=100)
    breakfast = models.CharField(max_length=255)
    lunch = models.CharField(max_length=255)
    dinner = models.CharField(max_length=255)
    snacks = models.CharField(max_length=255)

class MonthlyAttendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total_attendance = models.IntegerField()
    completed_attendance = models.IntegerField()
    cancelled_attendance = models.IntegerField()

class Organization(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    admin = models.CharField(max_length=100)

class Status(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    mess = models.ForeignKey(Mess, on_delete=models.CASCADE)
    location = models.CharField(max_length=100)
    roll_no = models.CharField(max_length=50)

class BookingManager(models.Manager):
    def active(self):
        return self.filter(cancelled=False)

class Booking(models.Model):
    booking_id   = models.BigAutoField(primary_key=True)
    user      = models.ForeignKey(User,     on_delete=models.CASCADE, null=True)
    meal_slot    = models.ForeignKey(MealType, on_delete=models.CASCADE)
    created_at    = models.DateTimeField(auto_now_add=True)
    cancelled    = models.BooleanField(default=False)

    objects = BookingManager()

    # one user -> one booking per meal_slot
    # Prevents duplicate bookings for the same meal slot by the same user.
    class Meta:
        unique_together = ("user", "meal_slot")   #1 booking per slot per student

    
    # bookings can be cancelled only 1 hour before the meal_slot
    def can_cancel(self):
        """
        Allow cancellation only within 1 hour of booking.
        """
        return timezone.now() <= self.created_at + timedelta(hours=1)
    
    def __str__(self):
        return f"Booking {self.booking_id} - User {self.user.name if self.user else 'N/A'}"



class Notification(models.Model):
    title = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class AuditLog(models.Model):
    action = models.CharField(max_length=255)
    performed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField()















