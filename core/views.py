from django.shortcuts import render
from django.db.models import Count
from django.http import HttpResponse
import csv

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import User, Mess, MealType, Coupon, Menu, Feedback, MessItems, MonthlyAttendance, Organization, Status, Booking, Notification, Booking, AuditLog

from .serializers import UserSerializer, MessSerializer, RegisterSerializer, MealTypeSerializer, CouponSerializer, BookingSerializer, NotificationSerializer, MessUsageReportSerializer, AuditLogSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from core.permissions import IsSelfOrAdmin
import uuid

def health_check(request):
    return JsonResponse({"status": "ok"})

def home(request):
    return JsonResponse({"message": "Welcome to Mess Management"})

#list users
class UserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all()
        return Response(UserSerializer(users, many=True).data)

class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        user.delete()
        return Response(status=204)   

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user_id):
        return get_object_or_404(User, pk=user_id)

    def get(self, request, user_id):
        user = self.get_object(user_id)
        self.check_object_permissions(request, user)
        return Response(UserSerializer(user).data)

    def delete(self, request, user_id):
        user = self.get_object(user_id)
        self.check_object_permissions(request, user)
        user.delete()
        return Response(status=204)

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated(), IsSelfOrAdmin()]
    
class AdminCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        data = request.data
        user = User.objects.create_user(
            name=data['name'],
            email=data['email'],
            phone=data['phone'],
            room_no=data['room_no'],
            roll_no=data['roll_no'],
            password=data['password'],
            is_staff=True,
            is_superuser=True
        )
        return Response(UserSerializer(user).data, status=201)


class MessListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        messes = Mess.objects.all()
        serializer = MessSerializer(messes, many=True)
        return Response(serializer.data)

    def post(self, request):
        self.check_permissions(request)
        serializer = MessSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]

class MessDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.request.method in ["PUT", "DELETE"]:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]

    def get(self, request, mess_id):
        mess = get_object_or_404(Mess, mess_id=mess_id)
        return Response(MessSerializer(mess).data)

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

    def get_permissions(self):
        return [IsAuthenticated(), IsAdminUser()]

    def put(self, request, slot_id):
        slot = get_object_or_404(MealType, id=slot_id)
        serializer = MealTypeSerializer(slot, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, slot_id):
        slot = get_object_or_404(MealType, id=slot_id)
        slot.delete()
        return Response({"message": "Meal slot deleted"}, status=204)

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
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        student_id   = request.data.get("studentId")
        mess_id      = request.data.get("messId")
        meal_type    = request.data.get("meal_type")
        session_time = request.data.get("session_time")
        location     = request.data.get("location")

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
            created_by   = request.user.name,
        )
        return Response(CouponSerializer(coupon).data, status=201)


# Coupon validation
class ValidateCouponView(APIView):
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

        coupon.cancelled = True
        coupon.save()
        return Response({"valid": True, "message": "Coupon redeemed"}, status=200)

# My coupons
class MyCouponListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        coupons = Coupon.objects.filter(user=request.user)
        return Response(CouponSerializer(coupons, many=True).data)

# Bookings
class BookingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.is_staff:
            bookings = Booking.objects.all()
        else:
            bookings = Booking.objects.filter(user=request.user)

        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    def post(self, request):
        student_id  = request.data.get("userId")
        slot_id     = request.data.get("mealSlotId")

        if None in [student_id, slot_id]:
            return Response({"detail": "userId and mealSlotId are required"}, status=400)

        try:
            user_obj = User.objects.get(pk=student_id)
            slot     = MealType.objects.get(pk=slot_id)
        except (User.DoesNotExist, MealType.DoesNotExist):
            return Response({"detail": "User or meal slot not found"}, status=404)

        if (request.user != user_obj) and (not request.user.is_staff):
            return Response({"detail": "You can only book meals for yourself"}, status=403)

        if Booking.objects.filter(user=user_obj, meal_slot=slot, cancelled=False).exists():
            return Response({"detail": "Meal already booked"}, status=400)

        booking = Booking.objects.create(user=user_obj, meal_slot=slot)
        return Response(BookingSerializer(booking).data, status=201)
    
    # Booking.objects.active()  # gets all non-cancelled bookings
    

class BookingDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, booking_id):
        booking = get_object_or_404(Booking, pk=booking_id)

        if (booking.user != request.user) and (not request.user.is_staff):
            return Response({"detail": "Not authorized to cancel"}, status=403)

        if booking.cancelled:
            return Response({"detail": "Booking already cancelled"}, status=400)

        #cancellation allowed until 1 hr of booked meal-slot
        if booking.can_cancel():
            booking.cancelled = True
            booking.save()
            return Response({"message": "Booking cancelled"}, status=204)
        else:
            return Response({"detail": "Cancellation window expired (1 hour limit)"}, status=403)


class BookingHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, userId):
        if request.user.user_id != int(userId) and not request.user.is_staff:
            return Response({"detail": "Permission denied."}, status=403)

        bookings = Booking.objects.filter(user__user_id=userId).order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

class MealAvailabilityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.is_staff:
            slots = MealType.objects.filter(available=True)
        else:
            slots = MealType.objects.filter(mess=user.mess, available=True)

        serializer = MealTypeSerializer(slots, many=True)
        return Response(serializer.data)

class NotificationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Notification sent"}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MessUsageReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
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
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        rows = (
            Booking.objects
            .filter(cancelled=False)
            .values("meal_slot__mess_id", "meal_slot__mess__name")
            .annotate(
                total_meals=Count("booking_id"),
                unique_users=Count("user", distinct=True)
            )
            .order_by("meal_slot__mess_id")
        )

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


class AuditLogView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        logs = AuditLog.objects.all().order_by('-timestamp')
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)



