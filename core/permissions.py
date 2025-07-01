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
