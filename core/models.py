from django.db import models

# Create your models here.

class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    room_no = models.CharField(max_length=10)
    phone = models.CharField(max_length=15)
    email = models.EmailField(unique=True)
    roll_no = models.CharField(max_length=20, unique=True)
    coupon = models.CharField(max_length=100, null=True, blank=True)  # Placeholder, change to FK later if needed

    def is_active(self):
        # Placeholder: Always active; you can change this logic later
        return True

    def __str__(self):
        return f"{self.name} ({self.roll_no})"


class Mess(models.Model):
    mess_id = models.AutoField(primary_key=True)
    mess_name = models.CharField(max_length=100)
    mess_location = models.CharField(max_length=100)
    mess_availability = models.BooleanField(default=True)
    stock = models.IntegerField(default=0)
    mess_admin = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='administered_mess')
    mess_current_status = models.CharField(max_length=50, default="Open")
    mess_bookings = models.TextField(null=True, blank=True)  # Placeholder
    mess_menu = models.TextField(null=True, blank=True)      # Placeholder

    def __str__(self):
        return self.mess_name


