from rest_framework import serializers

from .models import User, Mess, Booking, Coupon, Menu, MealType, Feedback, MessItems, MonthlyAttendance, Organization, Status, Notification, AuditLog
from django.contrib.auth.hashers import make_password


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {"password": {"write_only": True}}


class MessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mess
        fields = '__all__'

class MealTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealType
        fields = '__all__'

    def validate(self, data):
        delay = data.get("delay_minutes")
        if delay and delay > 0:
            data["delayed"] = True
        else:
            data["delayed"] = False
            data["delay_minutes"] = None
        return data


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("name","room_no", "phone", "email", "roll_no", "password")
        extra_kwargs = {"password": {"write_only": True}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def validate_roll_no(self, value):
        if User.objects.filter(roll_no=value).exists():
            raise serializers.ValidationError("Roll-no already registered")
        return value

    #in order to has password before it is being saved 
    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        return super().create(validated_data)
    
class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Coupon
        fields = "__all__"
        read_only_fields = ["c_id", "cancelled", "created_at", "created_by"]

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['booking_id', 'created_at', 'cancelled']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class MessUsageReportSerializer(serializers.Serializer):
    mess_id      = serializers.IntegerField()
    mess_name    = serializers.CharField()
    total_meals  = serializers.IntegerField()
    unique_users = serializers.IntegerField()

class AuditLogSerializer(serializers.ModelSerializer):
    performed_by = serializers.StringRelatedField()

    class Meta:
        model = AuditLog
        fields = '__all__'



