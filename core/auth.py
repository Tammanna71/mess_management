from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed
from core.models import User

"""
OPTIMIZATION: Token-Based Role Extraction

This authentication system has been optimized to extract roles and permissions 
directly from JWT tokens instead of computing them from database queries.

Benefits:
- ✅ No database queries for role computation during authentication
- ✅ Faster authentication (no need to check user.is_staff, user.is_superuser, etc.)
- ✅ Reduced database load
- ✅ Better scalability
- ✅ Roles are computed once during token creation, not on every request

How it works:
1. During login: Roles are computed and embedded in JWT token
2. During authentication: Roles are extracted from token (no DB queries)
3. Fallback: If token doesn't have roles, fallback to database computation
"""


# -----------------------------
# Role & permission resolution
# -----------------------------
def compute_user_roles(user):
    """
    Extract user roles based on user attributes.
    Adjust this logic to your needs (e.g., groups, explicit user.role field).
    """
    roles = []

    # Check user flags
    if getattr(user, 'is_superuser', False):
        roles.append('superuser')
    if getattr(user, 'is_staff', False):
        roles.append('staff')

    # NOTE: name-based admin is fragile; keep if you need it temporarily.
    name_val = (getattr(user, 'name', '') or '').strip().lower()
    if name_val == 'admin':
        roles.append('admin')

    # Regular users (non-staff, non-superuser) -> student
    if not getattr(user, 'is_staff', False) and not getattr(user, 'is_superuser', False):
        roles.append('student')

    # All authenticated users
    roles.append('user')

    # Deduplicate & sort for consistency
    return sorted(set(roles))


def get_user_permissions(user, roles):
    """
    Get user permissions based on roles.
    You can replace this with Django permissions/groups if needed.
    """
    permissions = []

    if 'superuser' in roles:
        permissions.extend([
            'user.create', 'user.read', 'user.update', 'user.delete',
            'mess.create', 'mess.read', 'mess.update', 'mess.delete',
            'booking.create', 'booking.read', 'booking.update', 'booking.delete',
            'coupon.create', 'coupon.read', 'coupon.update', 'coupon.delete',
            'report.read', 'report.export', 'audit.read'
        ])
    elif 'admin' in roles:
        permissions.extend([
            'user.read', 'user.update', 'user.delete',
            'mess.create', 'mess.read', 'mess.update', 'mess.delete',
            'booking.read', 'booking.update', 'booking.delete',
            'coupon.create', 'coupon.read', 'coupon.update', 'coupon.delete',
            'report.read', 'report.export', 'audit.read'
        ])
    elif 'staff' in roles:
        permissions.extend([
            'user.read',
            'mess.read', 'mess.update',
            'booking.read', 'booking.update',
            'coupon.create', 'coupon.read', 'coupon.update',
            'report.read'
        ])
    elif 'student' in roles:
        permissions.extend([
            'user.read', 'user.update',  # Typically refers to own profile
            'mess.read',
            'booking.create', 'booking.read', 'booking.update',  # Own bookings
            'coupon.read',  # Own coupons
        ])

    # All authenticated users
    permissions.extend(['auth.login', 'auth.logout', 'auth.refresh'])

    return sorted(set(permissions))


# ---------------------------------
# Authentication with role support
# ---------------------------------
class CoreUserJWTAuthentication(JWTAuthentication):
    """
    JWT auth that fetches users from core_user instead of auth_user.
    Includes role-based authentication support.
    Optimized to extract roles from JWT token instead of computing from database.
    """

    def get_user(self, validated_token):
        user_id = validated_token.get(api_settings.USER_ID_CLAIM)

        if user_id is None:
            raise AuthenticationFailed("Token contained no user_id")

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found", code="user_not_found")

        if not user.is_active:
            raise AuthenticationFailed("User inactive", code="user_inactive")

        return user

    def authenticate(self, request):
        """
        Override authenticate to extract role information from JWT token.
        This is more efficient as it avoids database queries for role computation.
        """
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)

        # Extract roles from JWT token instead of computing from database
        # This is more efficient as roles are already computed and stored in token
        user.roles = validated_token.get('roles', [])
        user.permissions = validated_token.get('permissions', [])
        
        # Also extract other user info from token for convenience
        user.token_name = validated_token.get('name', '')
        user.token_email = validated_token.get('email', '')
        user.token_phone = validated_token.get('phone', '')
        user.token_is_staff = validated_token.get('is_staff', False)
        user.token_is_superuser = validated_token.get('is_superuser', False)

        return (user, validated_token)


class RoleBasedJWTAuthentication(CoreUserJWTAuthentication):
    """
    Enhanced JWT authentication with role-based access control.
    Optimized to extract roles from JWT token instead of computing from database.
    """

    def get_user_roles(self, user):
        """
        Get user roles from token data if available, otherwise fallback to computation.
        This maintains backward compatibility while being more efficient.
        """
        # If roles are already extracted from token, use them
        if hasattr(user, 'roles') and user.roles:
            return user.roles
        
        # Fallback to computing roles (for backward compatibility)
        return compute_user_roles(user)


# --------------------------------------------
# Token creation with roles (access + refresh)
# --------------------------------------------
def create_tokens_with_roles(user):
    """
    Create JWT tokens with role and permission information included
    in BOTH refresh and access token payloads.
    """
    refresh = RefreshToken.for_user(user)

    # Compute roles & permissions once
    roles = compute_user_roles(user)
    permissions = get_user_permissions(user, roles)

    # Common user info
    user_id = getattr(user, 'id', None) or getattr(user, 'user_id', None)
    name = getattr(user, 'name', '')
    email = getattr(user, 'email', '')
    phone = getattr(user, 'phone', '')

    # ---- Add custom claims to REFRESH token ----
    refresh['user_id'] = user_id
    refresh['name'] = name
    refresh['email'] = email
    refresh['phone'] = phone
    refresh['roles'] = roles
    refresh['is_staff'] = getattr(user, 'is_staff', False)
    refresh['is_superuser'] = getattr(user, 'is_superuser', False)
    refresh['permissions'] = permissions

    # ---- Add custom claims to ACCESS token as well ----
    access = refresh.access_token
    access['user_id'] = user_id
    access['name'] = name
    access['email'] = email
    access['phone'] = phone
    access['roles'] = roles
    access['is_staff'] = getattr(user, 'is_staff', False)
    access['is_superuser'] = getattr(user, 'is_superuser', False)
    access['permissions'] = permissions

    return {
        'refresh': str(refresh),
        'access': str(access),
        'user_info': {
            'user_id': user_id,
            'name': name,
            'email': email,
            'phone': phone,
            'roles': roles,
            'permissions': permissions
        }
    }


# ------------------------------------
# Quick server-side verification utils
# ------------------------------------
def verify_user_permission(user, required_permission):
    """
    Verify if user has a specific permission.
    Optimized to use token-based permissions if available.
    """
    # If permissions are already extracted from token, use them
    if hasattr(user, 'permissions') and user.permissions:
        return required_permission in user.permissions
    
    # Fallback to computing permissions (for backward compatibility)
    roles = compute_user_roles(user)
    permissions = get_user_permissions(user, roles)
    return required_permission in permissions


def verify_user_role(user, required_role):
    """
    Verify if user has a specific role.
    Optimized to use token-based roles if available.
    """
    # If roles are already extracted from token, use them
    if hasattr(user, 'roles') and user.roles:
        return required_role in user.roles
    
    # Fallback to computing roles (for backward compatibility)
    roles = compute_user_roles(user)
    return required_role in roles
