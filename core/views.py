from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
# Create your views here.
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import User, Mess
from .serializers import UserSerializer, MessSerializer

def health_check(request):
    return JsonResponse({"status": "ok"})

def home(request):
    return JsonResponse({"message": "Welcome to Mess Management"})



# Login API (Dummy Example: mobile + password check)
class StudentLoginView(APIView):
    def post(self, request):
        mobile = request.data.get("mobile")
        password = request.data.get("password")

        user = User.objects.filter(phone=mobile).first()
        if user and password == "pass123":  # Replace with actual auth
            return Response({"token": "dummy_token", "user_id": user.user_id})
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


# Mess CRUD
class MessListCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = MessSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        messes = Mess.objects.all()
        serializer = MessSerializer(messes, many=True)
        return Response(serializer.data)


class MessDetailView(APIView):
    def put(self, request, mess_id):
        mess = get_object_or_404(Mess, mess_id=mess_id)
        serializer = MessSerializer(mess, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, mess_id):
        mess = get_object_or_404(Mess, mess_id=mess_id)
        mess.delete()
        return Response({"message": "Mess deleted"}, status=status.HTTP_204_NO_CONTENT)

