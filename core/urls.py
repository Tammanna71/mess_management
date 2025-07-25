from django.urls import path
from . import views
from .views import RegisterView, AdminCreateView, BaseLoginMixin, StudentLoginView, AdminLoginView, UserListView, UserDetailView, MessListCreateView, MessDetailView, health_check, home
from .views import MealSlotDetailView, MealSlotView, GenerateCouponView, ValidateCouponView, MyCouponListView, BookingDeleteView, BookingView, MealAvailabilityView, NotificationView, MessUsageReportView, MessUsageExportView, BookingHistoryView, AuditLogView
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

urlpatterns = [
    path('', views.health_check),
    path('home/', views.home),

    #Auth
    path('auth/student/login', StudentLoginView.as_view()),
    path('auth/admin/login', AdminLoginView.as_view()),
    path('auth/signup', RegisterView.as_view(), name='register'),
    path('admin/signup', AdminCreateView.as_view()),
    
    #users
    path('users/', UserListView.as_view(), name='user-list'),
    path('user/<int:user_id>/', UserDetailView.as_view()),

    #mess
    path('mess/', MessListCreateView.as_view()),
    path('mess/<int:mess_id>/', MessDetailView.as_view()),

    path("meal-slot", MealSlotView.as_view(), name="meal-slot-list-create"),
    path("meal-slot/<int:slot_id>", MealSlotDetailView.as_view(), name="meal-slot-detail"),

    path("coupon",           GenerateCouponView.as_view()),
    path("coupon/validate",  ValidateCouponView.as_view()),
    path("coupons/my", MyCouponListView.as_view()),   # GET – students see only their coupons

    path("booking", BookingView.as_view(),        name="booking-create"),
    path("booking/<int:booking_id>", BookingDeleteView.as_view(), name="booking-delete"),
    path("booking/availability", MealAvailabilityView.as_view(), name="meal-avail"),

    path('notifications/', NotificationView.as_view()),

    path("report/mess-usage", MessUsageReportView.as_view()),
    path("report/export",     MessUsageExportView.as_view()),

    path('history/<int:userId>', BookingHistoryView.as_view()),
    path('audit-logs', AuditLogView.as_view()),

]




# path('auth/token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
# path("auth/token/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    





