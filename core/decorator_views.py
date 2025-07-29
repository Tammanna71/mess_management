"""
Example Views Demonstrating JWT Decorator Usage

This module shows how to use the JWT decorators for protecting API endpoints
with different levels of access control.
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from core.decorators import (
    jwt_token_required, 
    admin_only, 
    role_required, 
    permission_required,
    superuser_only,
    staff_only,
    student_only,
    authenticated_only
)


# ============================================================================
# ADMIN-ONLY ENDPOINTS
# ============================================================================

@csrf_exempt
@require_http_methods(["GET"])
@admin_only
def admin_dashboard(request):
    """
    Admin dashboard - only accessible by admin users.
    """
    return JsonResponse({
        "message": "Welcome to Admin Dashboard",
        "user_id": request.user_id,
        "user_info": request.token_data,
        "endpoint": "Admin Dashboard",
        "features": [
            "User Management",
            "System Settings",
            "Reports & Analytics",
            "Audit Logs"
        ]
    })


@csrf_exempt
@require_http_methods(["POST"])
@admin_only
def create_user(request):
    """
    Create new user - admin only.
    """
    return JsonResponse({
        "message": "User creation endpoint",
        "user_id": request.user_id,
        "user_info": request.token_data,
        "endpoint": "Create User",
        "note": "This endpoint would handle user creation logic"
    })


@csrf_exempt
@require_http_methods(["GET"])
@admin_only
def system_settings(request):
    """
    System settings - admin only.
    """
    return JsonResponse({
        "message": "System Settings",
        "user_id": request.user_id,
        "user_info": request.token_data,
        "endpoint": "System Settings",
        "settings": {
            "mess_timing": "Configure meal timings",
            "user_roles": "Manage user roles",
            "system_config": "System configuration"
        }
    })


# ============================================================================
# ROLE-BASED ENDPOINTS
# ============================================================================

@csrf_exempt
@require_http_methods(["GET"])
@role_required(['admin', 'staff'])
def staff_dashboard(request):
    """
    Staff dashboard - accessible by admin or staff.
    """
    return JsonResponse({
        "message": "Welcome to Staff Dashboard",
        "user_id": request.user_id,
        "user_info": request.token_data,
        "endpoint": "Staff Dashboard",
        "features": [
            "Mess Management",
            "Booking Management",
            "Basic Reports"
        ]
    })


@csrf_exempt
@require_http_methods(["GET"])
@superuser_only
def superuser_panel(request):
    """
    Superuser panel - only accessible by superusers.
    """
    return JsonResponse({
        "message": "Welcome to Superuser Panel",
        "user_id": request.user_id,
        "user_info": request.token_data,
        "endpoint": "Superuser Panel",
        "features": [
            "Full System Access",
            "Database Management",
            "Security Settings",
            "All Admin Features"
        ]
    })


@csrf_exempt
@require_http_methods(["GET"])
@student_only
def student_portal(request):
    """
    Student portal - only accessible by students.
    """
    return JsonResponse({
        "message": "Welcome to Student Portal",
        "user_id": request.user_id,
        "user_info": request.token_data,
        "endpoint": "Student Portal",
        "features": [
            "View Mess Menu",
            "Book Meals",
            "View Coupons",
            "Update Profile"
        ]
    })


# ============================================================================
# PERMISSION-BASED ENDPOINTS
# ============================================================================

@csrf_exempt
@require_http_methods(["GET"])
@permission_required(['user.read'])
def user_list(request):
    """
    List users - requires user.read permission.
    """
    return JsonResponse({
        "message": "User List",
        "user_id": request.user_id,
        "user_info": request.token_data,
        "endpoint": "User List",
        "required_permission": "user.read",
        "note": "This endpoint would return list of users"
    })


@csrf_exempt
@require_http_methods(["POST"])
@permission_required(['user.create', 'user.update'])
def user_management(request):
    """
    User management - requires both user.create and user.update permissions.
    """
    return JsonResponse({
        "message": "User Management",
        "user_id": request.user_id,
        "user_info": request.token_data,
        "endpoint": "User Management",
        "required_permissions": ["user.create", "user.update"],
        "note": "This endpoint can create and update users"
    })


@csrf_exempt
@require_http_methods(["GET"])
@permission_required(['mess.read', 'booking.read'], require_all=False)
def flexible_access(request):
    """
    Flexible access - requires either mess.read OR booking.read permission.
    """
    return JsonResponse({
        "message": "Flexible Access Endpoint",
        "user_id": request.user_id,
        "user_info": request.token_data,
        "endpoint": "Flexible Access",
        "required_permissions": ["mess.read", "booking.read"],
        "access_type": "ANY permission required",
        "note": "Accessible if user has either mess.read OR booking.read permission"
    })


# ============================================================================
# AUTHENTICATED-ONLY ENDPOINTS
# ============================================================================

@csrf_exempt
@require_http_methods(["GET"])
@authenticated_only
def user_profile(request):
    """
    User profile - accessible by any authenticated user.
    """
    return JsonResponse({
        "message": "User Profile",
        "user_id": request.user_id,
        "user_info": request.token_data,
        "endpoint": "User Profile",
        "access_type": "Any authenticated user",
        "note": "This endpoint shows user's own profile"
    })


@csrf_exempt
@require_http_methods(["GET"])
@jwt_token_required
def token_info(request):
    """
    Token information - accessible by any user with valid JWT token.
    """
    return JsonResponse({
        "message": "Token Information",
        "user_id": request.user_id,
        "user_info": request.token_data,
        "endpoint": "Token Info",
        "access_type": "Any valid JWT token",
        "token_data": request.token_data
    })


# ============================================================================
# COMPLEX PERMISSION ENDPOINTS
# ============================================================================

@csrf_exempt
@require_http_methods(["GET"])
@role_required('admin')
@permission_required(['user.delete'])
def admin_user_delete(request):
    """
    Admin user deletion - requires admin role AND user.delete permission.
    Note: This demonstrates combining decorators (though it's better to use
    a single decorator with complex logic).
    """
    return JsonResponse({
        "message": "Admin User Deletion",
        "user_id": request.user_id,
        "user_info": request.token_data,
        "endpoint": "Admin User Delete",
        "requirements": {
            "role": "admin",
            "permission": "user.delete"
        },
        "note": "This endpoint can delete users (admin + delete permission)"
    })


# ============================================================================
# ERROR HANDLING EXAMPLES
# ============================================================================

@csrf_exempt
@require_http_methods(["GET"])
def unprotected_endpoint(request):
    """
    Unprotected endpoint - no decorators, accessible by anyone.
    """
    return JsonResponse({
        "message": "Unprotected Endpoint",
        "endpoint": "No Protection",
        "warning": "This endpoint has no authentication or authorization",
        "note": "Anyone can access this endpoint"
    })


# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@csrf_exempt
@require_http_methods(["GET"])
def decorator_test_info(request):
    """
    Information about available decorators and their usage.
    """
    return JsonResponse({
        "message": "JWT Decorator Test Information",
        "available_decorators": {
            "@jwt_token_required": "Validates JWT token, any authenticated user",
            "@admin_only": "Admin users only (admin, staff, superuser)",
            "@superuser_only": "Superusers only",
            "@staff_only": "Staff or admin users",
            "@student_only": "Students only",
            "@role_required(['admin', 'staff'])": "Specific roles required",
            "@permission_required(['user.read'])": "Specific permissions required",
            "@permission_required(['user.read', 'mess.read'], require_all=False)": "Any permission required"
        },
        "usage_examples": {
            "admin_dashboard": "/api/decorator/admin-dashboard/",
            "staff_dashboard": "/api/decorator/staff-dashboard/",
            "student_portal": "/api/decorator/student-portal/",
            "user_profile": "/api/decorator/user-profile/",
            "token_info": "/api/decorator/token-info/"
        },
        "note": "All endpoints require Authorization: Bearer <token> header"
    }) 