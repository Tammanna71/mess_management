from django.urls import path
from . import views
from .views import RegisterView, AdminCreateView, BaseLoginMixin, StudentLoginView, AdminLoginView, UserListView, UserDetailView, MessListCreateView, MessDetailView, health_check, home
from .views import MealSlotDetailView, MealSlotView, GenerateCouponView, ValidateCouponView, MyCouponListView, BookingDeleteView, BookingView, MealAvailabilityView, NotificationView, MessUsageReportView, MessUsageExportView, BookingHistoryView, AuditLogView
from .views import TokenInfoView, RoleBasedTestView, PermissionBasedTestView, SuperUserOnlyView, StudentOnlyView, FlexiblePermissionView, ComplexPermissionView
from .decorator_views import (
    admin_dashboard, create_user, system_settings, staff_dashboard, superuser_panel, 
    student_portal, user_list, user_management, flexible_access, user_profile, 
    token_info, admin_user_delete, unprotected_endpoint, decorator_test_info
)
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

urlpatterns = [
    path('', views.health_check),
    path('home/', views.home),

    #Auth
    path('auth/student/login/', StudentLoginView.as_view()),
    path('auth/admin/login/', AdminLoginView.as_view()),
    path('auth/signup/', RegisterView.as_view(), name='register'),
    path('auth/admin/signup/', AdminCreateView.as_view()),
    
    # JWT Token endpoints
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
    # Token and Role Testing
    path('token/info', TokenInfoView.as_view(), name='token-info'),
    path('test/role-based', RoleBasedTestView.as_view(), name='role-test'),
    path('test/permission-based', PermissionBasedTestView.as_view(), name='permission-test'),
    path('test/superuser-only', SuperUserOnlyView.as_view(), name='superuser-test'),
    path('test/student-only', StudentOnlyView.as_view(), name='student-test'),
    path('test/flexible-permission', FlexiblePermissionView.as_view(), name='flexible-permission-test'),
    path('test/complex-permission', ComplexPermissionView.as_view(), name='complex-permission-test'),
    
    # JWT Decorator Examples
    path('decorator/info', decorator_test_info, name='decorator-info'),
    path('decorator/admin-dashboard', admin_dashboard, name='admin-dashboard'),
    path('decorator/create-user', create_user, name='create-user'),
    path('decorator/system-settings', system_settings, name='system-settings'),
    path('decorator/staff-dashboard', staff_dashboard, name='staff-dashboard'),
    path('decorator/superuser-panel', superuser_panel, name='superuser-panel'),
    path('decorator/student-portal', student_portal, name='student-portal'),
    path('decorator/user-list', user_list, name='user-list'),
    path('decorator/user-management', user_management, name='user-management'),
    path('decorator/flexible-access', flexible_access, name='flexible-access'),
    path('decorator/user-profile', user_profile, name='user-profile'),
    path('decorator/token-info', token_info, name='decorator-token-info'),
    path('decorator/admin-user-delete', admin_user_delete, name='admin-user-delete'),
    path('decorator/unprotected', unprotected_endpoint, name='unprotected'),
    
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
    





