from rest_framework.permissions import BasePermission

class IsNameAdmin(BasePermission):
    """
    Only allow requests where the authenticated user's `name` is 'admin' (case-insensitive).
    """
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "name", "").lower() == "admin"
        )
    
from rest_framework.permissions import BasePermission

class IsAdminUserCustom(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.name.lower() == 'admin'

class IsSelfOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.name.lower() == 'admin' or obj == request.user

