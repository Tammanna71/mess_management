from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed
from core.models import User


class CoreUserJWTAuthentication(JWTAuthentication):
    """
    JWT auth that fetches users from core_user instead of auth_user.
    Includes role-based authentication support.
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
        Override authenticate to add role information to the user object.
        """
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)
        
        # Add role information to user object for easy access
        user.roles = self.get_user_roles(user)
        
        return (user, validated_token)

    def get_user_roles(self, user):
        """
        Extract user roles based on user attributes.
        """
        roles = []
        
        # Check user permissions and add appropriate roles
        if user.is_superuser:
            roles.append('superuser')
        if user.is_staff:
            roles.append('staff')
        if user.name.lower() == 'admin':
            roles.append('admin')
        
        # Add student role for regular users (non-staff)
        if not user.is_staff and not user.is_superuser:
            roles.append('student')
        
        # Add user role for all authenticated users
        roles.append('user')
        
        return list(set(roles))  # Remove duplicates


class RoleBasedJWTAuthentication(CoreUserJWTAuthentication):
    """
    Enhanced JWT authentication with role-based access control.
    """
    
    def get_user_roles(self, user):
        """
        Enhanced role extraction with more granular roles.
        """
        roles = []
        
        # Superuser gets all roles
        if user.is_superuser:
            roles.extend(['superuser', 'admin', 'staff', 'user'])
        # Staff users
        elif user.is_staff:
            roles.extend(['staff', 'user'])
        # Admin users (by name)
        elif user.name.lower() == 'admin':
            roles.extend(['admin', 'user'])
        # Regular students
        else:
            roles.append('student')
            roles.append('user')
        
        return list(set(roles))  # Remove duplicates


def create_tokens_with_roles(user):
    """
    Create JWT tokens with role information included in the payload.
    """
    refresh = RefreshToken.for_user(user)
    
    # Add custom claims including roles
    refresh['user_id'] = user.user_id
    refresh['name'] = user.name
    refresh['email'] = user.email
    refresh['phone'] = user.phone
    
    # Add role information
    auth_instance = CoreUserJWTAuthentication()
    roles = auth_instance.get_user_roles(user)
    refresh['roles'] = roles
    refresh['is_staff'] = user.is_staff
    refresh['is_superuser'] = user.is_superuser
    
    # Add permissions based on roles
    permissions = get_user_permissions(user, roles)
    refresh['permissions'] = permissions
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user_info': {
            'user_id': user.user_id,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'roles': roles,
            'permissions': permissions
        }
    }


def get_user_permissions(user, roles):
    """
    Get user permissions based on roles.
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
            'user.read', 'user.update',
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
            'user.read', 'user.update',  # Can read/update own profile
            'mess.read',
            'booking.create', 'booking.read', 'booking.update',  # Own bookings only
            'coupon.read',  # Own coupons only
        ])
    
    # All authenticated users get these basic permissions
    permissions.extend(['auth.login', 'auth.logout', 'auth.refresh'])
    
    return list(set(permissions))  # Remove duplicates


def verify_user_permission(user, required_permission):
    """
    Verify if user has a specific permission.
    """
    auth_instance = CoreUserJWTAuthentication()
    roles = auth_instance.get_user_roles(user)
    permissions = get_user_permissions(user, roles)
    
    return required_permission in permissions


def verify_user_role(user, required_role):
    """
    Verify if user has a specific role.
    """
    auth_instance = CoreUserJWTAuthentication()
    roles = auth_instance.get_user_roles(user)
    
    return required_role in roles
