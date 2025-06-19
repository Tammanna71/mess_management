from rest_framework import serializers

# class StudentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Student 
#         fields = '__all__'
from .models import User, Mess

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class MessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mess
        fields = '__all__'
