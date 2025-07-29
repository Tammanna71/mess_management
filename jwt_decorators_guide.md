# JWT Decorators Guide for Django API

## 🔐 **Overview**

This guide explains how to use JWT decorators to protect your Django API endpoints with role-based access control. The decorators validate JWT tokens and check user roles/permissions before allowing access.

## 📋 **Available Decorators**

### **1. `@jwt_token_required`**
Validates JWT token and ensures user is authenticated.

```python
@jwt_token_required
def my_api_view(request):
    # Any authenticated user can access this
    return JsonResponse({"message": "Hello authenticated user!"})
```

### **2. `@admin_only`**
Ensures only admin users can access the endpoint.

```python
@admin_only
def admin_dashboard(request):
    # Only admin, staff, or superuser can access this
    return JsonResponse({"message": "Welcome to Admin Dashboard"})
```

### **3. `@role_required(roles)`**
Ensures user has specific roles.

```python
@role_required(['admin', 'staff'])
def staff_dashboard(request):
    # Only admin or staff can access this
    return JsonResponse({"message": "Staff Dashboard"})

@role_required('superuser')
def superuser_panel(request):
    # Only superuser can access this
    return JsonResponse({"message": "Superuser Panel"})
```

### **4. `@permission_required(permissions, require_all=True)`**
Ensures user has specific permissions.

```python
@permission_required(['user.read'])
def user_list(request):
    # User must have user.read permission
    return JsonResponse({"message": "User List"})

@permission_required(['user.create', 'user.update'])
def user_management(request):
    # User must have BOTH user.create AND user.update permissions
    return JsonResponse({"message": "User Management"})

@permission_required(['user.read', 'mess.read'], require_all=False)
def flexible_access(request):
    # User must have EITHER user.read OR mess.read permission
    return JsonResponse({"message": "Flexible Access"})
```

### **5. Convenience Decorators**

```python
@superuser_only
def superuser_endpoint(request):
    # Only superusers
    pass

@staff_only
def staff_endpoint(request):
    # Only staff or admin
    pass

@student_only
def student_endpoint(request):
    # Only students
    pass

@authenticated_only
def any_authenticated_user(request):
    # Any authenticated user
    pass
```

## 🚀 **Usage Examples**

### **Basic Admin-Only Endpoint**

```python
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from core.decorators import admin_only

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
        "features": [
            "User Management",
            "System Settings",
            "Reports & Analytics"
        ]
    })
```

### **Role-Based Endpoint**

```python
from core.decorators import role_required

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
        "features": [
            "Mess Management",
            "Booking Management",
            "Basic Reports"
        ]
    })
```

### **Permission-Based Endpoint**

```python
from core.decorators import permission_required

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
        "required_permissions": ["user.create", "user.update"]
    })
```

### **Flexible Permission Endpoint**

```python
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
        "access_type": "ANY permission required"
    })
```

## 🔧 **How It Works**

### **1. Token Validation**
- Extracts JWT token from `Authorization: Bearer <token>` header
- Validates token signature and expiration
- Extracts user information from token payload

### **2. Role/Permission Checking**
- Checks user roles against required roles
- Checks user permissions against required permissions
- Supports both single and multiple requirements

### **3. Request Enhancement**
- Adds `request.user_id` with user ID
- Adds `request.token_data` with complete user information

### **4. Error Handling**
- Returns appropriate HTTP status codes
- Provides detailed error messages
- Handles token expiration and invalid tokens

## 📊 **Response Format**

### **Success Response**
```json
{
    "message": "Welcome to Admin Dashboard",
    "user_id": 12,
    "user_info": {
        "user_id": 12,
        "name": "Admin User",
        "email": "admin@example.com",
        "roles": ["admin", "user"],
        "permissions": ["user.read", "user.update", ...],
        "is_staff": true,
        "is_superuser": false
    }
}
```

### **Error Response (401 Unauthorized)**
```json
{
    "error": "Authorization header is required",
    "message": "Please provide a valid JWT token in the Authorization header"
}
```

### **Error Response (403 Forbidden)**
```json
{
    "error": "Access denied",
    "message": "This endpoint requires admin privileges",
    "required_role": "admin",
    "user_roles": ["student", "user"]
}
```

## 🧪 **Testing the Decorators**

### **1. Get Information About Decorators**
```bash
GET /api/decorator/info
```

### **2. Test Admin-Only Endpoint**
```bash
GET /api/decorator/admin-dashboard
Authorization: Bearer <admin-token>
```

### **3. Test Role-Based Endpoint**
```bash
GET /api/decorator/staff-dashboard
Authorization: Bearer <staff-token>
```

### **4. Test Permission-Based Endpoint**
```bash
GET /api/decorator/user-list
Authorization: Bearer <user-read-token>
```

### **5. Test Flexible Permission Endpoint**
```bash
GET /api/decorator/flexible-access
Authorization: Bearer <any-permission-token>
```

## 🔒 **Security Features**

### **1. Token Validation**
- ✅ Validates JWT signature
- ✅ Checks token expiration
- ✅ Extracts user information securely

### **2. Role-Based Access Control**
- ✅ Supports single roles
- ✅ Supports multiple roles (ANY)
- ✅ Hierarchical role checking

### **3. Permission-Based Access Control**
- ✅ Supports single permissions
- ✅ Supports multiple permissions (ALL)
- ✅ Supports flexible permissions (ANY)

### **4. Error Handling**
- ✅ Detailed error messages
- ✅ Appropriate HTTP status codes
- ✅ Security-conscious error responses

## 📝 **Best Practices**

### **1. Use Appropriate Decorators**
```python
# ✅ Good - Specific role requirement
@role_required('admin')
def admin_only_function(request):
    pass

# ❌ Avoid - Too broad
@jwt_token_required
def admin_only_function(request):
    # Check admin role manually
    pass
```

### **2. Combine with HTTP Method Decorators**
```python
# ✅ Good - Specific HTTP method
@require_http_methods(["GET"])
@admin_only
def admin_dashboard(request):
    pass

# ✅ Good - Multiple HTTP methods
@require_http_methods(["GET", "POST"])
@role_required(['admin', 'staff'])
def flexible_endpoint(request):
    pass
```

### **3. Use CSRF Exemption for API Endpoints**
```python
# ✅ Good - API endpoints don't need CSRF
@csrf_exempt
@admin_only
def api_endpoint(request):
    pass
```

### **4. Access User Information**
```python
@admin_only
def my_view(request):
    # Access user information from token
    user_id = request.user_id
    user_info = request.token_data
    
    # Use in your logic
    return JsonResponse({
        "user_id": user_id,
        "user_name": user_info['name'],
        "user_roles": user_info['roles']
    })
```

## 🎯 **Common Use Cases**

### **1. Admin Dashboard**
```python
@admin_only
def admin_dashboard(request):
    # Only admins can access
    pass
```

### **2. Staff Management**
```python
@role_required(['admin', 'staff'])
def staff_management(request):
    # Admin or staff can access
    pass
```

### **3. User Management**
```python
@permission_required(['user.read', 'user.update'])
def user_management(request):
    # Must have both permissions
    pass
```

### **4. Flexible Access**
```python
@permission_required(['mess.read', 'booking.read'], require_all=False)
def flexible_dashboard(request):
    # Must have either permission
    pass
```

### **5. Superuser Only**
```python
@superuser_only
def system_admin(request):
    # Only superusers
    pass
```

## 🔄 **Integration with Existing Views**

You can easily integrate these decorators with your existing Django views:

```python
# Before (using DRF permissions)
class AdminView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        return Response({"message": "Admin only"})

# After (using decorators)
@admin_only
def admin_view(request):
    return JsonResponse({"message": "Admin only"})
```

## 🏆 **Benefits**

1. **Simple to Use**: Just add a decorator to your view
2. **Flexible**: Supports roles, permissions, and combinations
3. **Secure**: Proper JWT validation and error handling
4. **Reusable**: Works with any Django view
5. **Clear**: Self-documenting code
6. **Maintainable**: Centralized authentication logic

The JWT decorators provide a clean, secure, and flexible way to protect your Django API endpoints with role-based access control! 🎉 