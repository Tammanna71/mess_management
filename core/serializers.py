from rest_framework import serializers

from .models import User, Mess, Coupon, Menu, MealType, Feedback, MessItems, MonthlyAttendance, Organization, Status
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