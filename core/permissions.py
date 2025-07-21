# permissions.py

from rest_framework.permissions import BasePermission, SAFE_METHODS

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




# from rest_framework.permissions import BasePermission, SAFE_METHODS


# class IsAdminUser(BasePermission):
#     """
#     Allows access only to users with is_staff=True.
#     """
#     def has_permission(self, request, view):
#         return request.user and request.user.is_authenticated and request.user.is_staff


# class IsSelfOrAdmin(BasePermission):
#     """
#     Allow users to access their own object, or admin users.
#     """
#     def has_object_permission(self, request, view, obj):
#         return request.user and request.user.is_authenticated and (
#             request.user.is_staff or obj == request.user
#         )


# class IsReadOnly(BasePermission):
#     """
#     Allow only GET, HEAD or OPTIONS requests.
#     """
#     def has_permission(self, request, view):
#         return request.method in SAFE_METHODS




# # from rest_framework.permissions import BasePermission

# # class IsNameAdmin(BasePermission):
# #     """
# #     Only allow requests where the authenticated user's `name` is 'admin' (case-insensitive).
# #     """
# #     def has_permission(self, request, view):
# #         return (
# #             request.user
# #             and request.user.is_authenticated
# #             and getattr(request.user, "name", "").lower() == "admin"
# #         )

# # class IsSelfOrAdmin(BasePermission):
# #     def has_object_permission(self, request, view, obj):
# #         return request.user.name.lower() == 'admin' or obj == request.user

