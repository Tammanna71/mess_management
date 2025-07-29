# permissions.py

from rest_framework.permissions import BasePermission, SAFE_METHODS
from core.auth import verify_user_permission, verify_user_role


class IsAdmin(BasePermission):
    """
    Allows access only to users with is_staff=True (admin users).
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff


class IsSelfOrAdmin(BasePermission):
    """
    Allow access to own resource or if admin.
    """
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj == request.user


class ReadOnly(BasePermission):
    """
    Allow read-only access.
    """
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS


# Generic Role-Based Permission Class
class HasRole(BasePermission):
    """
    Allow access only to users with specific roles.
    Supports single role, multiple roles, or any combination.
    
    Usage:
    - HasRole('admin')  # Single role
    - HasRole(['admin', 'staff'])  # Any of these roles
    - HasRole('superuser')  # Single role
    """
    def __init__(self, required_roles):
        self.required_roles = required_roles if isinstance(required_roles, list) else [required_roles]
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has any of the required roles
        for role in self.required_roles:
            if verify_user_role(request.user, role):
                return True
        return False


# Generic Permission-Based Permission Class
class HasPermission(BasePermission):
    """
    Allow access only to users with specific permissions.
    Supports single permission, multiple permissions (ALL required), or any combination.
    
    Usage:
    - HasPermission('user.read')  # Single permission
    - HasPermission(['user.read', 'user.update'])  # ALL permissions required
    - HasPermission('mess.create')  # Single permission
    """
    def __init__(self, required_permissions, require_all=True):
        self.required_permissions = required_permissions if isinstance(required_permissions, list) else [required_permissions]
        self.require_all = require_all  # True = ALL permissions required, False = ANY permission
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if self.require_all:
            # Check if user has ALL required permissions
            for permission in self.required_permissions:
                if not verify_user_permission(request.user, permission):
                    return False
            return True
        else:
            # Check if user has ANY of the required permissions
            for permission in self.required_permissions:
                if verify_user_permission(request.user, permission):
                    return True
            return False


# Convenience Classes for Common Patterns
class AdminOrStaff(BasePermission):
    """
    Allow access to admin or staff users.
    Convenience class for common admin/staff access pattern.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            verify_user_role(request.user, 'admin') or 
            verify_user_role(request.user, 'staff') or
            verify_user_role(request.user, 'superuser')
        )


class StudentOrAdmin(BasePermission):
    """
    Allow access to students or admin users.
    Convenience class for endpoints accessible to both students and admins.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            verify_user_role(request.user, 'student') or 
            verify_user_role(request.user, 'admin') or
            verify_user_role(request.user, 'staff') or
            verify_user_role(request.user, 'superuser')
        )


# Example of how to use the generic classes (for documentation)
"""
EXAMPLES OF USAGE:

# Role-based access
class AdminOnlyView(APIView):
    permission_classes = [HasRole('admin')]

class AdminOrStaffView(APIView):
    permission_classes = [HasRole(['admin', 'staff'])]

class SuperUserOnlyView(APIView):
    permission_classes = [HasRole('superuser')]

# Permission-based access
class UserManagementView(APIView):
    permission_classes = [HasPermission(['user.read', 'user.update'])]  # ALL required

class MessReadView(APIView):
    permission_classes = [HasPermission('mess.read')]  # Single permission

class FlexibleView(APIView):
    permission_classes = [HasPermission(['user.read', 'mess.read'], require_all=False)]  # ANY permission

# Convenience classes
class AdminStaffView(APIView):
    permission_classes = [AdminOrStaff]

class StudentAdminView(APIView):
    permission_classes = [StudentOrAdmin]

# Combining multiple permission classes
class ComplexView(APIView):
    permission_classes = [
        HasRole('admin'),  # Must be admin
        HasPermission('user.delete')  # AND have delete permission
    ]
"""

