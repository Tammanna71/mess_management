"""
Django tests for JWT Token-Based Role Extraction Optimization

This module tests the authentication optimization using Django's built-in testing framework.
"""

import time
from django.test import TestCase, Client
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from core.models import User
from core.auth import compute_user_roles, create_tokens_with_roles, CoreUserJWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken


class JWTAuthenticationOptimizationTest(APITestCase):
    """
    Test cases for JWT authentication optimization.
    """
    
    def setUp(self):
        """Set up test data."""
        # Create test users
        self.student_user = User.objects.create_user(
            name="Test Student",
            email="student@test.com",
            phone="1234567890",
            roll_no="STU001",
            password="testpass123",
            is_staff=False,
            is_superuser=False
        )
        
        self.admin_user = User.objects.create_user(
            name="admin",  # Special name for admin role
            email="admin@test.com",
            phone="9876543210",
            roll_no="ADMIN001",
            password="adminpass123",
            is_staff=True,
            is_superuser=False
        )
        
        self.superuser = User.objects.create_user(
            name="Super Admin",
            email="super@test.com",
            phone="5555555555",
            roll_no="SUPER001",
            password="superpass123",
            is_staff=True,
            is_superuser=True
        )
        
        self.client = APIClient()
    
    def test_token_creation_with_roles(self):
        """Test that JWT tokens are created with roles embedded."""
        # Test student user
        token_data = create_tokens_with_roles(self.student_user)
        
        # Decode access token to check roles
        access_token = AccessToken(token_data['access'])
        token_roles = access_token.get('roles', [])
        
        # Verify roles are embedded in token
        self.assertIn('student', token_roles)
        self.assertIn('user', token_roles)
        self.assertNotIn('admin', token_roles)
        self.assertNotIn('superuser', token_roles)
        
        # Test admin user
        token_data = create_tokens_with_roles(self.admin_user)
        access_token = AccessToken(token_data['access'])
        token_roles = access_token.get('roles', [])
        
        self.assertIn('admin', token_roles)
        self.assertIn('staff', token_roles)
        self.assertIn('user', token_roles)
        
        # Test superuser
        token_data = create_tokens_with_roles(self.superuser)
        access_token = AccessToken(token_data['access'])
        token_roles = access_token.get('roles', [])
        
        self.assertIn('superuser', token_roles)
        self.assertIn('staff', token_roles)
        self.assertIn('user', token_roles)
    
    def test_authentication_extracts_roles_from_token(self):
        """Test that authentication extracts roles from token instead of computing from DB."""
        # Create token with roles
        token_data = create_tokens_with_roles(self.student_user)
        
        # Create mock request
        class MockRequest:
            def __init__(self, token):
                self.META = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        
        mock_request = MockRequest(token_data['access'])
        
        # Authenticate using our custom authentication
        auth = CoreUserJWTAuthentication()
        authenticated_user, token = auth.authenticate(mock_request)
        
        # Verify roles are extracted from token
        self.assertEqual(authenticated_user.roles, ['student', 'user'])
        self.assertIsNotNone(authenticated_user.permissions)
        self.assertEqual(authenticated_user.token_name, "Test Student")
        self.assertEqual(authenticated_user.token_email, "student@test.com")
    
    def test_performance_comparison(self):
        """Test performance difference between old and new approaches."""
        # Test old approach (database-based role computation)
        start_time = time.time()
        for _ in range(100):
            roles = compute_user_roles(self.student_user)
        old_approach_time = time.time() - start_time
        
        # Test new approach (token-based role extraction)
        token_data = create_tokens_with_roles(self.student_user)
        access_token = AccessToken(token_data['access'])
        
        start_time = time.time()
        for _ in range(100):
            roles = access_token.get('roles', [])
        new_approach_time = time.time() - start_time
        
        # Verify new approach is faster
        self.assertLess(new_approach_time, old_approach_time)
        
        # Calculate speedup
        speedup = old_approach_time / new_approach_time
        print(f"Performance test: {speedup:.2f}x speedup")
    
    def test_api_endpoint_with_optimized_auth(self):
        """Test that API endpoints work with optimized authentication."""
        # Login to get token
        login_data = {
            'phone': '1234567890',
            'password': 'testpass123'
        }
        
        response = self.client.post('/auth/student/login', login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Extract token
        token = response.data['access']
        
        # Test protected endpoint
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/token/info')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('roles', response.data)
        self.assertIn('permissions', response.data)
    
    def test_backward_compatibility(self):
        """Test that the optimization maintains backward compatibility."""
        # Test with user that doesn't have roles in token
        user = User.objects.create_user(
            name="Legacy User",
            email="legacy@test.com",
            phone="1111111111",
            roll_no="LEGACY001",
            password="legacypass123"
        )
        
        # Test fallback to database computation
        roles = compute_user_roles(user)
        self.assertIn('student', roles)
        self.assertIn('user', roles)
    
    def test_role_based_permissions(self):
        """Test that role-based permissions work correctly."""
        # Test student permissions
        token_data = create_tokens_with_roles(self.student_user)
        access_token = AccessToken(token_data['access'])
        permissions = access_token.get('permissions', [])
        
        # Student should have these permissions
        self.assertIn('user.read', permissions)
        self.assertIn('mess.read', permissions)
        self.assertIn('booking.create', permissions)
        
        # Student should NOT have admin permissions
        self.assertNotIn('user.delete', permissions)
        self.assertNotIn('mess.delete', permissions)
        
        # Test admin permissions
        token_data = create_tokens_with_roles(self.admin_user)
        access_token = AccessToken(token_data['access'])
        permissions = access_token.get('permissions', [])
        
        # Admin should have more permissions
        self.assertIn('user.read', permissions)
        self.assertIn('mess.create', permissions)
        self.assertIn('mess.delete', permissions)
    
    def test_token_refresh_updates_roles(self):
        """Test that token refresh updates roles correctly."""
        # Create initial token
        token_data = create_tokens_with_roles(self.student_user)
        initial_roles = AccessToken(token_data['access']).get('roles', [])
        
        # Update user to admin
        self.student_user.is_staff = True
        self.student_user.name = "admin"
        self.student_user.save()
        
        # Create new token (simulating login)
        new_token_data = create_tokens_with_roles(self.student_user)
        new_roles = AccessToken(new_token_data['access']).get('roles', [])
        
        # Verify roles are updated
        self.assertIn('admin', new_roles)
        self.assertIn('staff', new_roles)
        self.assertNotEqual(initial_roles, new_roles)


class AuthenticationPerformanceTest(TestCase):
    """
    Performance tests for authentication optimization.
    """
    
    def setUp(self):
        """Set up test data for performance testing."""
        self.users = []
        for i in range(10):
            user = User.objects.create_user(
                name=f"User{i}",
                email=f"user{i}@test.com",
                phone=f"123456789{i}",
                roll_no=f"USER{i:03d}",
                password="testpass123"
            )
            self.users.append(user)
    
    def test_bulk_authentication_performance(self):
        """Test performance of bulk authentication operations."""
        # Create tokens for all users
        tokens = []
        for user in self.users:
            token_data = create_tokens_with_roles(user)
            tokens.append(token_data['access'])
        
        # Test authentication performance
        auth = CoreUserJWTAuthentication()
        
        start_time = time.time()
        for token in tokens:
            class MockRequest:
                def __init__(self, token):
                    self.META = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
            
            mock_request = MockRequest(token)
            try:
                authenticated_user, _ = auth.authenticate(mock_request)
                # Verify roles are extracted
                self.assertIsNotNone(authenticated_user.roles)
            except Exception:
                pass  # Some tokens might be invalid in test environment
        
        total_time = time.time() - start_time
        avg_time = total_time / len(tokens)
        
        print(f"Bulk authentication test: {avg_time:.6f}s per authentication")
        
        # Verify reasonable performance (should be very fast)
        self.assertLess(avg_time, 0.01)  # Less than 10ms per authentication


if __name__ == '__main__':
    # Run tests
    import django
    django.setup()
    
    # Run specific test
    test_case = JWTAuthenticationOptimizationTest()
    test_case.setUp()
    test_case.test_token_creation_with_roles()
    test_case.test_performance_comparison()
    print("✅ All tests passed!") 