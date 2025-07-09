from django.shortcuts import render
from django.db.models import Count
from django.http import HttpResponse
import csv

from rest_framework.decorators import api_view
from rest_framework.response import Response
# Create your views here.
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import User, Mess, MealType, Coupon, Menu, Feedback, MessItems, MonthlyAttendance, Organization, Status, Booking, Notification, Booking, AuditLog

from .serializers import UserSerializer, MessSerializer, RegisterSerializer, MealTypeSerializer, CouponSerializer, BookingSerializer, NotificationSerializer, MessUsageReportSerializer, AuditLogSerializer
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsNameAdmin
import uuid

def health_check(request):
    return JsonResponse({"status": "ok"})

def home(request):
    return JsonResponse({"message": "Welcome to Mess Management"})


#list users
class UserListView(APIView):
    permission_classes = [IsNameAdmin]

    def get(self, request):
        users = User.objects.all()
        return Response(UserSerializer(users, many=True).data)
    

#get and delete specific user    
class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        # Admin can view anyone's details
        if request.user.name.lower() == "admin" or request.user.user_id == user_id:
            user = get_object_or_404(User, pk=user_id)
            return Response(UserSerializer(user).data)
        return Response({"detail": "Not authorized to view this user"}, status=403)

    def delete(self, request, user_id):
        # Only admin can delete users
        if request.user.name.lower() != "admin":
            return Response({"detail": "Only admin can delete users"}, status=403)

        user = get_object_or_404(User, pk=user_id)
        user.delete()
        return Response(status=204)
    

class MessListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        messes = Mess.objects.all()
        serializer = MessSerializer(messes, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Allow only admin to create mess
        if request.user.name.lower() != "admin":
            return Response({"detail": "Only admin can add messes"}, status=status.HTTP_403_FORBIDDEN)

        serializer = MessSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MessDetailView(APIView):
    permission_classes = [IsAuthenticated]        # every request must be authenticated

    def get(self, request, mess_id):
        """Optional: expose single mess for viewing."""
        mess = get_object_or_404(Mess, mess_id=mess_id)
        return Response(MessSerializer(mess).data)

    def put(self, request, mess_id):
        """Allow only admin to update mess."""
        if request.user.name.lower() != "admin":
            return Response(
                {"detail": "Only admin can update messes"},
                status=status.HTTP_403_FORBIDDEN,
        )

        mess = get_object_or_404(Mess, mess_id=mess_id)
        serializer = MessSerializer(mess, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, mess_id):
        """Allow deletion only if the authenticated user is admin."""
        if request.user.name.lower() != "admin":
            return Response(
                {"detail": "Only admin can delete messes"},
                status=status.HTTP_403_FORBIDDEN,
            )

        mess = get_object_or_404(Mess, mess_id=mess_id)
        mess.delete()
        return Response({"message": "Mess deleted"}, status=status.HTTP_204_NO_CONTENT)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        if ser.is_valid():
            ser.save()
            return Response(ser.data, status=201)
        return Response(ser.errors, status=400)


class BaseLoginMixin(APIView):
    """Shared helper for both login views."""
    permission_classes = [AllowAny]

    def _issue_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            status=200,
        )


class StudentLoginView(BaseLoginMixin):
    """
    Accepts phone + password,rejects admin at this endpoint.
    """
    def post(self, request):
        phone = request.data.get("phone")
        password = request.data.get("password")

        user = get_object_or_404(User, phone=phone)

        # Block admin from using the student endpoint
        if user.name.lower() == "admin":
            return Response(
                {"detail": "Admin must use /auth/admin/login"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if check_password(password, user.password):
            return self._issue_tokens(user)

        return Response({"detail": "Invalid credentials"}, status=401)


class AdminLoginView(BaseLoginMixin):
    """
    Only the user named 'admin' may log in here.
    """
    def post(self, request):
        phone = request.data.get("phone")
        password = request.data.get("password")

        user = get_object_or_404(User, phone=phone)

        # Must be admin
        if user.name.lower() != "admin":
            return Response(
                {"detail": "Only admin can use this endpoint"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if check_password(password, user.password):
            return self._issue_tokens(user)

        return Response({"detail": "Invalid credentials"}, status=401)
    

class MealSlotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.name.lower() != "admin":
            return Response({"detail": "Only admin can create meal slots"}, status=403)

        serializer = MealTypeSerializer(data=request.data)
        print("Incoming data:", request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        slots = MealType.objects.all()
        serializer = MealTypeSerializer(slots, many=True)
        return Response(serializer.data)

class MealSlotDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, slot_id):
        if request.user.name.lower() != "admin":
            return Response({"detail": "Only admin can update meal slots"}, status=403)

        slot = get_object_or_404(MealType, id=slot_id)
        serializer = MealTypeSerializer(slot, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slot_id):
        if request.user.name.lower() != "admin":
            return Response({"detail": "Only admin can delete meal slots"}, status=403)

        slot = get_object_or_404(MealType, id=slot_id)
        slot.delete()
        return Response({"message": "Meal slot deleted"}, status=status.HTTP_204_NO_CONTENT)

class GenerateCouponView(APIView):
    """
    Only admin can generate a coupon for a student for a given mess / meal slot.
    Expected JSON:
    {
      "studentId": 3,
      "messId"   : 2,
      "meal_type": "Breakfast",
      "session_time": 8.30,
      "location" : "Block-A"
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.name.lower() != "admin":
            return Response({"detail": "Only admin can generate coupons"}, status=403)

        student_id   = request.data.get("studentId")
        mess_id      = request.data.get("messId")
        meal_type    = request.data.get("meal_type")
        session_time = request.data.get("session_time")
        location     = request.data.get("location")

        # Basic validation
        if None in [student_id, mess_id, meal_type, session_time, location]:
            return Response({"detail": "Missing required fields"}, status=400)

        try:
            student = User.objects.get(pk=student_id)
            mess    = Mess.objects.get(pk=mess_id)
        except User.DoesNotExist:
            return Response({"detail": "Student not found"}, status=404)
        except Mess.DoesNotExist:
            return Response({"detail": "Mess not found"}, status=404)

        coupon = Coupon.objects.create(
            user         = student,
            mess         = mess,
            meal_type    = meal_type,
            session_time = session_time,
            location     = location,
            created_by   = request.user.name,   # admin name
        )
        return Response(CouponSerializer(coupon).data, status=201)


class ValidateCouponView(APIView):
    """
    Body: { "couponId": 123 }
    Marks coupon as 'cancelled=True' once validated (acts like 'used').
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        coupon_id = request.data.get("couponId")
        if not coupon_id:
            return Response({"detail": "couponId required"}, status=400)

        try:
            coupon = Coupon.objects.get(c_id=coupon_id)
        except Coupon.DoesNotExist:
            return Response({"detail": "Invalid coupon"}, status=404)

        if coupon.user != request.user:
            return Response({"detail": "You are not allowed to use this coupon"}, status=403)

        if coupon.cancelled:
            return Response({"valid": False, "message": "Coupon already used"}, status=400)

        
        # Mark as used
        coupon.cancelled = True
        coupon.save()
        return Response({"valid": True, "message": "Coupon redeemed"}, status=200)

class MyCouponListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        coupons = Coupon.objects.filter(user=request.user)
        return Response(CouponSerializer(coupons, many=True).data)
    

class BookingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.name.lower() == "admin":
            bookings = Booking.objects.all()
        else:
            bookings = Booking.objects.filter(user=user)
        
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)


    def post(self, request):
        """
        Body:
        {
          "userId": 3,
          "mealSlotId": 5
        }
        """
        student_id  = request.data.get("userId")
        slot_id     = request.data.get("mealSlotId")

        if None in [student_id, slot_id]:
            return Response({"detail": "userId and mealSlotId are required"}, status=400)

        try:
            user_obj = User.objects.get(pk=user_id)
            slot    = MealType.objects.get(pk=slot_id)
        except (User.DoesNotExist, MealType.DoesNotExist):
            return Response({"detail": "User or meal slot not found"}, status=404)

        # Rule: a student can book only themselves unless admin
        if (request.user != user_obj) and (request.user.name.lower() != "admin"):
            return Response({"detail": "You can only book meals for yourself"}, status=403)

        # Prevent duplicate booking for the same slot
        if Booking.objects.filter(user=user_obj, meal_slot=slot, cancelled=False).exists():
            return Response({"detail": "Meal already booked"}, status=400)

        booking = Booking.objects.create(user=user_obj, meal_slot=slot)
        return Response(BookingSerializer(booking).data, status=201)


class BookingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, booking_id):
        booking = get_object_or_404(Booking, pk=booking_id)

        # Only owner or admin can cancel
        if (booking.user != request.user) and (request.user.name.lower() != "admin"):
            return Response({"detail": "Not authorized to cancel"}, status=403)

        if booking.cancelled:
            return Response({"detail": "Booking already cancelled"}, status=400)

        booking.cancelled = True
        booking.save()
        return Response({"message": "Booking cancelled"}, status=204)
    
class MealAvailabilityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.name.lower() == "admin":
            slots = MealType.objects.filter(available=True)
        else:
            slots = MealType.objects.filter(mess=user.mess, available=True)

        serializer = MealTypeSerializer(slots, many=True)
        return Response(serializer.data)
    
class NotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.name.lower() != "admin":
            return Response({"detail": "Only admin can send notifications"}, status=403)

        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Notification sent"}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MessUsageReportView(APIView):
    """GET  /report/mess-usage   → JSON summary (admin only)"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.name.lower() != "admin":
            return Response({"detail": "Only admin can view reports"}, status=403)

        data = (
            Booking.objects
            .filter(cancelled=False)
            .values("meal_slot__mess_id", "meal_slot__mess__name")
            .annotate(
                total_meals=Count("booking_id"),
                unique_users=Count("user", distinct=True)
            )
            .order_by("meal_slot__mess_id")
        )

        # reshape keys to match serializer
        processed = [
            {
                "mess_id"     : row["meal_slot__mess_id"],
                "mess_name"   : row["meal_slot__mess__name"],
                "total_meals" : row["total_meals"],
                "unique_users": row["unique_users"],
            }
            for row in data
        ]

        ser = MessUsageReportSerializer(processed, many=True)
        return Response(ser.data)


class MessUsageExportView(APIView):
    """GET  /report/export  → CSV download (admin only)"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.name.lower() != "admin":
            return Response({"detail": "Only admin can export reports"}, status=403)

        # Re-use the same query as above
        rows = (
            Booking.objects
            .filter(cancelled=False)
            .values("meal_slot__mess_id", "meal_slot__mess__name")
            .annotate(
                total_meals=Count("booking_id"),
                unique_users=Count("student", distinct=True)
            )
            .order_by("meal_slot__mess_id")
        )

        # --- build CSV response ---
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename=mess_usage_report.csv"

        writer = csv.writer(response)
        writer.writerow(["Mess ID", "Mess Name", "Total Meals", "Unique Users"])

        for r in rows:
            writer.writerow([
                r["meal_slot__mess_id"],
                r["meal_slot__mess__name"],
                r["total_meals"],
                r["unique_users"],
            ])

        return response

# Booking history for a student
class BookingHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, studentId):
        if request.user.id != int(studentId) and not request.user.is_staff:
            return Response({"detail": "Permission denied."}, status=403)
        bookings = Booking.objects.filter(user__id=studentId).order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

# Admin Audit logs
class AuditLogView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({"detail": "Admin access required."}, status=403)
        logs = AuditLog.objects.all().order_by('-timestamp')
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)



