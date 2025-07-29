"""
Django Decorators for JWT Token Validation and Role-Based Access Control

This module provides decorators for protecting API endpoints with JWT token validation
and role-based access control.
"""

import functools
from django.http import JsonResponse
from django.conf import settings
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from core.auth import verify_user_role, verify_user_permission


def jwt_token_required(view_func):
    """
    Decorator to validate JWT token and ensure user is authenticated.
    
    Usage:
    @jwt_token_required
    def my_api_view(request):
        # Your view logic here
        pass
    """
    @functools.wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Get the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header:
            return JsonResponse({
                'error': 'Authorization header is required',
                'message': 'Please provide a valid JWT token in the Authorization header'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if it's a Bearer token
        if not auth_header.startswith('Bearer '):
            return JsonResponse({
                'error': 'Invalid authorization header format',
                'message': 'Authorization header must start with "Bearer "'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Extract the token
        token = auth_header.split(' ')[1]
        
        try:
            # Validate the token
            access_token = AccessToken(token)
            
            # Get user_id from token
            user_id = access_token.get('user_id')
            if not user_id:
                return JsonResponse({
                    'error': 'Invalid token',
                    'message': 'Token does not contain user information'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check if token is expired
            if access_token.is_expired():
                return JsonResponse({
                    'error': 'Token expired',
                    'message': 'JWT token has expired. Please login again.'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Add user_id to request for use in view
            request.user_id = user_id
            request.token_data = {
                'user_id': user_id,
                'name': access_token.get('name'),
                'email': access_token.get('email'),
                'roles': access_token.get('roles', []),
                'permissions': access_token.get('permissions', []),
                'is_staff': access_token.get('is_staff', False),
                'is_superuser': access_token.get('is_superuser', False)
            }
            
            return view_func(request, *args, **kwargs)
            
        except (InvalidToken, TokenError) as e:
            return JsonResponse({
                'error': 'Invalid token',
                'message': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return JsonResponse({
                'error': 'Token validation failed',
                'message': 'An error occurred while validating the token'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return wrapper


def admin_only(view_func):
    """
    Decorator to ensure only admin users can access the endpoint.
    Requires JWT token validation.
    
    Usage:
    @admin_only
    def admin_only_view(request):
        # Only admins can access this
        pass
    """
    @functools.wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # First validate JWT token
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header:
            return JsonResponse({
                'error': 'Authorization header is required',
                'message': 'Please provide a valid JWT token in the Authorization header'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not auth_header.startswith('Bearer '):
            return JsonResponse({
                'error': 'Invalid authorization header format',
                'message': 'Authorization header must start with "Bearer "'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        token = auth_header.split(' ')[1]
        
        try:
            # Validate the token
            access_token = AccessToken(token)
            
            # Check if token is expired
            if access_token.is_expired():
                return JsonResponse({
                    'error': 'Token expired',
                    'message': 'JWT token has expired. Please login again.'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Get user information from token
            user_id = access_token.get('user_id')
            roles = access_token.get('roles', [])
            is_staff = access_token.get('is_staff', False)
            is_superuser = access_token.get('is_superuser', False)
            
            # Check if user has admin role
            has_admin_role = (
                'admin' in roles or 
                'superuser' in roles or 
                is_staff or 
                is_superuser
            )
            
            if not has_admin_role:
                return JsonResponse({
                    'error': 'Access denied',
                    'message': 'This endpoint requires admin privileges',
                    'required_role': 'admin',
                    'user_roles': roles
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Add user information to request
            request.user_id = user_id
            request.token_data = {
                'user_id': user_id,
                'name': access_token.get('name'),
                'email': access_token.get('email'),
                'roles': roles,
                'permissions': access_token.get('permissions', []),
                'is_staff': is_staff,
                'is_superuser': is_superuser
            }
            
            return view_func(request, *args, **kwargs)
            
        except (InvalidToken, TokenError) as e:
            return JsonResponse({
                'error': 'Invalid token',
                'message': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return JsonResponse({
                'error': 'Token validation failed',
                'message': 'An error occurred while validating the token'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return wrapper


def role_required(required_roles):
    """
    Decorator to ensure user has specific roles.
    Requires JWT token validation.
    
    Usage:
    @role_required(['admin', 'staff'])
    def admin_or_staff_view(request):
        # Only admin or staff can access this
        pass
    
    @role_required('superuser')
    def superuser_only_view(request):
        # Only superuser can access this
        pass
    """
    def decorator(view_func):
        @functools.wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Validate JWT token
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            
            if not auth_header:
                return JsonResponse({
                    'error': 'Authorization header is required',
                    'message': 'Please provide a valid JWT token in the Authorization header'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if not auth_header.startswith('Bearer '):
                return JsonResponse({
                    'error': 'Invalid authorization header format',
                    'message': 'Authorization header must start with "Bearer "'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.split(' ')[1]
            
            try:
                # Validate the token
                access_token = AccessToken(token)
                
                # Check if token is expired
                if access_token.is_expired():
                    return JsonResponse({
                        'error': 'Token expired',
                        'message': 'JWT token has expired. Please login again.'
                    }, status=status.HTTP_401_UNAUTHORIZED)
                
                # Get user information from token
                user_id = access_token.get('user_id')
                roles = access_token.get('roles', [])
                
                # Convert required_roles to list if it's a string
                required_roles_list = required_roles if isinstance(required_roles, list) else [required_roles]
                
                # Check if user has any of the required roles
                has_required_role = any(role in roles for role in required_roles_list)
                
                if not has_required_role:
                    return JsonResponse({
                        'error': 'Access denied',
                        'message': f'This endpoint requires one of the following roles: {", ".join(required_roles_list)}',
                        'required_roles': required_roles_list,
                        'user_roles': roles
                    }, status=status.HTTP_403_FORBIDDEN)
                
                # Add user information to request
                request.user_id = user_id
                request.token_data = {
                    'user_id': user_id,
                    'name': access_token.get('name'),
                    'email': access_token.get('email'),
                    'roles': roles,
                    'permissions': access_token.get('permissions', []),
                    'is_staff': access_token.get('is_staff', False),
                    'is_superuser': access_token.get('is_superuser', False)
                }
                
                return view_func(request, *args, **kwargs)
                
            except (InvalidToken, TokenError) as e:
                return JsonResponse({
                    'error': 'Invalid token',
                    'message': str(e)
                }, status=status.HTTP_401_UNAUTHORIZED)
            except Exception as e:
                return JsonResponse({
                    'error': 'Token validation failed',
                    'message': 'An error occurred while validating the token'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return wrapper
    return decorator


def permission_required(required_permissions, require_all=True):
    """
    Decorator to ensure user has specific permissions.
    Requires JWT token validation.
    
    Usage:
    @permission_required(['user.read', 'user.update'])
    def user_management_view(request):
        # User must have both user.read and user.update permissions
        pass
    
    @permission_required(['user.read', 'mess.read'], require_all=False)
    def flexible_view(request):
        # User must have either user.read OR mess.read permission
        pass
    """
    def decorator(view_func):
        @functools.wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Validate JWT token
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            
            if not auth_header:
                return JsonResponse({
                    'error': 'Authorization header is required',
                    'message': 'Please provide a valid JWT token in the Authorization header'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if not auth_header.startswith('Bearer '):
                return JsonResponse({
                    'error': 'Invalid authorization header format',
                    'message': 'Authorization header must start with "Bearer "'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.split(' ')[1]
            
            try:
                # Validate the token
                access_token = AccessToken(token)
                
                # Check if token is expired
                if access_token.is_expired():
                    return JsonResponse({
                        'error': 'Token expired',
                        'message': 'JWT token has expired. Please login again.'
                    }, status=status.HTTP_401_UNAUTHORIZED)
                
                # Get user information from token
                user_id = access_token.get('user_id')
                permissions = access_token.get('permissions', [])
                
                # Convert required_permissions to list if it's a string
                required_permissions_list = required_permissions if isinstance(required_permissions, list) else [required_permissions]
                
                # Check permissions based on require_all flag
                if require_all:
                    # User must have ALL required permissions
                    has_all_permissions = all(perm in permissions for perm in required_permissions_list)
                    if not has_all_permissions:
                        missing_permissions = [perm for perm in required_permissions_list if perm not in permissions]
                        return JsonResponse({
                            'error': 'Access denied',
                            'message': f'This endpoint requires all of the following permissions: {", ".join(required_permissions_list)}',
                            'required_permissions': required_permissions_list,
                            'missing_permissions': missing_permissions,
                            'user_permissions': permissions
                        }, status=status.HTTP_403_FORBIDDEN)
                else:
                    # User must have ANY of the required permissions
                    has_any_permission = any(perm in permissions for perm in required_permissions_list)
                    if not has_any_permission:
                        return JsonResponse({
                            'error': 'Access denied',
                            'message': f'This endpoint requires at least one of the following permissions: {", ".join(required_permissions_list)}',
                            'required_permissions': required_permissions_list,
                            'user_permissions': permissions
                        }, status=status.HTTP_403_FORBIDDEN)
                
                # Add user information to request
                request.user_id = user_id
                request.token_data = {
                    'user_id': user_id,
                    'name': access_token.get('name'),
                    'email': access_token.get('email'),
                    'roles': access_token.get('roles', []),
                    'permissions': permissions,
                    'is_staff': access_token.get('is_staff', False),
                    'is_superuser': access_token.get('is_superuser', False)
                }
                
                return view_func(request, *args, **kwargs)
                
            except (InvalidToken, TokenError) as e:
                return JsonResponse({
                    'error': 'Invalid token',
                    'message': str(e)
                }, status=status.HTTP_401_UNAUTHORIZED)
            except Exception as e:
                return JsonResponse({
                    'error': 'Token validation failed',
                    'message': 'An error occurred while validating the token'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return wrapper
    return decorator


# Convenience decorators for common use cases
def superuser_only(view_func):
    """Decorator to ensure only superusers can access the endpoint."""
    return role_required('superuser')(view_func)


def staff_only(view_func):
    """Decorator to ensure only staff users can access the endpoint."""
    return role_required(['admin', 'staff'])(view_func)


def student_only(view_func):
    """Decorator to ensure only students can access the endpoint."""
    return role_required('student')(view_func)


def authenticated_only(view_func):
    """Decorator to ensure user is authenticated (any valid JWT token)."""
    return jwt_token_required(view_func) 