#!/usr/bin/env python3
"""
Comprehensive API Test Suite for Mess Management System
Similar to Jest testing style but using Django's testing framework

This test file covers all APIs in the core app:
- Authentication APIs
- User Management APIs
- Mess Management APIs
- Booking APIs
- Coupon APIs
- Notification APIs
- Report APIs
- Role-based Access Control APIs
- Decorator-based APIs
"""

import json
import pytest
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import User, Mess, MealType, Coupon, Booking, Notification, AuditLog
from decimal import Decimal
from datetime import datetime, timedelta

User = get_user_model()

class MessManagementAPITestSuite(TestCase):
    """
    Comprehensive test suite for all Mess Management APIs
    """
    
    def setUp(self):
        """Set up test data before each test"""
        self.client = APIClient()
        self.base_url = "http://127.0.0.1:8000"
        
        # Create test users
        self.admin_user = User.objects.create_user(
            phone="+919876543220",
            email="admin_test@test.com",
            name="admin",
            roll_no="ADMIN999",
            password="adminpass123",
            is_staff=True,
            is_superuser=True
        )
        
        self.student_user = User.objects.create_user(
            phone="+919876543221",
            email="student_test@test.com",
            name="Student User",
            roll_no="22BCP999",
            password="studentpass123"
        )
        
        self.staff_user = User.objects.create_user(
            phone="+919876543222",
            email="staff_test@test.com",
            name="Staff User",
            roll_no="STAFF999",
            password="staffpass123",
            is_staff=True
        )
        
        # Create test mess
        self.mess = Mess.objects.create(
            name="Test Mess",
            location="Block A",
            availability=True,
            stock=100,
            admin="Test Admin",
            current_status="Open",
            bookings=0,
            menu="Rice, Dal, Vegetables"
        )
        
        # Create test meal type
        self.meal_type = MealType.objects.create(
            mess=self.mess,
            available=True,
            session_time=Decimal("8.30"),
            delayed=False,
            delay_minutes=None,
            reserve_meal=False
        )
        
        # Get tokens for different users
        self.admin_token = self._get_token(self.admin_user)
        self.student_token = self._get_token(self.student_user)
        self.staff_token = self._get_token(self.staff_user)
    
    def _get_token(self, user):
        """Helper method to get JWT token for a user"""
        # Use custom token creation with roles and permissions for testing
        from core.auth import create_tokens_with_roles
        token_data = create_tokens_with_roles(user)
        return token_data['access']
    
    def _authenticate_client(self, token):
        """Helper method to authenticate API client"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    # ==================== HEALTH CHECK & HOME TESTS ====================
    
    def test_health_check(self):
        """Test health check endpoint"""
        print("🧪 Testing Health Check API...")
        response = self.client.get(f"{self.base_url}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"status": "ok"})
        print("✅ Health Check API test passed")
    
    def test_home_endpoint(self):
        """Test home endpoint"""
        print("🧪 Testing Home API...")
        response = self.client.get(f"{self.base_url}/home/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"message": "Welcome to Mess Management"})
        print("✅ Home API test passed")

    # ==================== AUTHENTICATION TESTS ====================
    
    def test_student_login(self):
        """Test student login API"""
        print("🧪 Testing Student Login API...")
        data = {
            "phone": "+919876543221",
            "password": "studentpass123"
        }
        response = self.client.post(f"{self.base_url}/auth/student/login/", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.json())
        self.assertIn("refresh", response.json())
        print("✅ Student Login API test passed")
    
    def test_admin_login(self):
        """Test admin login API"""
        print("🧪 Testing Admin Login API...")
        data = {
            "phone": "+919876543220",
            "password": "adminpass123"
        }
        response = self.client.post(f"{self.base_url}/auth/admin/login/", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.json())
        self.assertIn("refresh", response.json())
        print("✅ Admin Login API test passed")
    
    def test_student_registration(self):
        """Test student registration API"""
        print("🧪 Testing Student Registration API...")
        data = {
            "name": "New Student",
            "email": "newstudent@test.com",
            "phone": "+919876543213",
            "roll_no": "22BCP998",
            "room_no": "A101",
            "password": "newpass123"
        }
        response = self.client.post(f"{self.base_url}/auth/signup/", data, format='json')
        if response.status_code != status.HTTP_201_CREATED:
            print(f"❌ Student registration failed: {response.status_code}")
            print(f"Response: {response.json()}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print("✅ Student Registration API test passed")
    
    def test_admin_creation(self):
        """Test admin creation API"""
        print("🧪 Testing Admin Creation API...")
        self._authenticate_client(self.admin_token)
        data = {
            "name": "New Admin",
            "email": "newadmin@test.com",
            "phone": "+919876543214",
            "password": "newadminpass123",
            "room_no": "A101",
            "roll_no": "ADMIN001"
        }
        response = self.client.post(f"{self.base_url}/auth/admin/signup/", data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print("✅ Admin Creation API test passed")

    # ==================== USER MANAGEMENT TESTS ====================
    
    def test_user_list(self):
        """Test user list API"""
        print("🧪 Testing User List API...")
        self._authenticate_client(self.admin_token)
        response = self.client.get(f"{self.base_url}/users/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.json(), list)
        print("✅ User List API test passed")
    
    def test_user_detail(self):
        """Test user detail API"""
        print("🧪 Testing User Detail API...")
        self._authenticate_client(self.student_token)
        response = self.client.get(f"{self.base_url}/user/{self.student_user.user_id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["name"], "Student User")
        print("✅ User Detail API test passed")
    
    def test_user_delete(self):
        """Test user delete API"""
        print("🧪 Testing User Delete API...")
        self._authenticate_client(self.admin_token)
        response = self.client.delete(f"{self.base_url}/user/{self.student_user.user_id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        print("✅ User Delete API test passed")

    # ==================== MESS MANAGEMENT TESTS ====================
    
    def test_mess_list(self):
        """Test mess list API"""
        print("🧪 Testing Mess List API...")
        self._authenticate_client(self.student_token)
        response = self.client.get(f"{self.base_url}/mess/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.json(), list)
        print("✅ Mess List API test passed")
    
    def test_mess_create(self):
        """Test mess creation API"""
        print("🧪 Testing Mess Creation API...")
        self._authenticate_client(self.admin_token)
        data = {
            "name": "New Mess",
            "location": "Block B",
            "availability": True,
            "stock": 50,
            "admin": "New Admin",
            "current_status": "Open",
            "bookings": 0,
            "menu": "Bread, Butter, Milk"
        }
        response = self.client.post(f"{self.base_url}/mess/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print("✅ Mess Creation API test passed")
    
    def test_mess_detail(self):
        """Test mess detail API"""
        print("🧪 Testing Mess Detail API...")
        self._authenticate_client(self.student_token)
        response = self.client.get(f"{self.base_url}/mess/{self.mess.mess_id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["name"], "Test Mess")
        print("✅ Mess Detail API test passed")
    
    def test_mess_update(self):
        """Test mess update API"""
        print("🧪 Testing Mess Update API...")
        self._authenticate_client(self.admin_token)
        data = {
            "name": "Updated Mess",
            "location": "Block C",
            "availability": True
        }
        response = self.client.put(f"{self.base_url}/mess/{self.mess.mess_id}/", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Mess Update API test passed")
    
    def test_mess_delete(self):
        """Test mess delete API"""
        print("🧪 Testing Mess Delete API...")
        self._authenticate_client(self.admin_token)
        response = self.client.delete(f"{self.base_url}/mess/{self.mess.mess_id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        print("✅ Mess Delete API test passed")

    # ==================== MEAL SLOT TESTS ====================
    
    def test_meal_slot_list(self):
        """Test meal slot list API"""
        print("🧪 Testing Meal Slot List API...")
        self._authenticate_client(self.student_token)
        response = self.client.get(f"{self.base_url}/meal-slot")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.json(), list)
        print("✅ Meal Slot List API test passed")
    
    def test_meal_slot_create(self):
        """Test meal slot creation API"""
        print("🧪 Testing Meal Slot Creation API...")
        self._authenticate_client(self.admin_token)
        data = {
            "mess": self.mess.mess_id,
            "type": "Lunch",
            "available": True,
            "session_time": "12.30",
            "delayed": False,
            "reserve_meal": False
        }
        response = self.client.post(f"{self.base_url}/meal-slot", data)
        if response.status_code != status.HTTP_201_CREATED:
            print(f"❌ Meal slot creation failed: {response.status_code}")
            print(f"Response: {response.json()}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print("✅ Meal Slot Creation API test passed")
    
    def test_meal_slot_detail(self):
        """Test meal slot detail API"""
        print("🧪 Testing Meal Slot Detail API...")
        self._authenticate_client(self.student_token)
        response = self.client.get(f"{self.base_url}/meal-slot/{self.meal_type.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("id", response.json())
        print("✅ Meal Slot Detail API test passed")
    
    def test_meal_slot_update(self):
        """Test meal slot update API"""
        print("🧪 Testing Meal Slot Update API...")
        self._authenticate_client(self.admin_token)
        data = {
            "available": True,
            "session_time": "9.00"
        }
        response = self.client.put(f"{self.base_url}/meal-slot/{self.meal_type.id}", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Meal Slot Update API test passed")
    
    def test_meal_slot_delete(self):
        """Test meal slot delete API"""
        print("🧪 Testing Meal Slot Delete API...")
        self._authenticate_client(self.admin_token)
        response = self.client.delete(f"{self.base_url}/meal-slot/{self.meal_type.id}")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        print("✅ Meal Slot Delete API test passed")

    # ==================== COUPON TESTS ====================
    
    def test_generate_coupon(self):
        """Test coupon generation API"""
        print("🧪 Testing Coupon Generation API...")
        self._authenticate_client(self.admin_token)
        data = {
            "studentId": self.student_user.user_id,
            "messId": self.mess.mess_id,
            "meal_type": "Breakfast",
            "session_time": 8.30,
            "location": "Block A"
        }
        response = self.client.post(f"{self.base_url}/coupon", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print("✅ Coupon Generation API test passed")
    
    def test_validate_coupon(self):
        """Test coupon validation API"""
        print("🧪 Testing Coupon Validation API...")
        # First create a coupon
        coupon = Coupon.objects.create(
            user=self.student_user,
            mess=self.mess,
            session_time=Decimal("8.30"),
            location="Block A",
            created_by="Admin",
            meal_type="Breakfast"
        )
        
        self._authenticate_client(self.student_token)
        data = {
            "couponId": coupon.c_id
        }
        response = self.client.post(f"{self.base_url}/coupon/validate", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Coupon Validation API test passed")
    
    def test_my_coupons(self):
        """Test my coupons API"""
        print("🧪 Testing My Coupons API...")
        # Create a coupon for the student
        Coupon.objects.create(
            user=self.student_user,
            mess=self.mess,
            session_time=Decimal("8.30"),
            location="Block A",
            created_by="Admin",
            meal_type="Breakfast"
        )
        
        self._authenticate_client(self.student_token)
        response = self.client.get(f"{self.base_url}/coupons/my")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.json(), list)
        print("✅ My Coupons API test passed")

    # ==================== BOOKING TESTS ====================
    
    def test_booking_list(self):
        """Test booking list API"""
        print("🧪 Testing Booking List API...")
        self._authenticate_client(self.student_token)
        response = self.client.get(f"{self.base_url}/booking")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.json(), list)
        print("✅ Booking List API test passed")
    
    def test_booking_create(self):
        """Test booking creation API"""
        print("🧪 Testing Booking Creation API...")
        self._authenticate_client(self.student_token)
        data = {
            "userId": self.student_user.user_id,
            "mealSlotId": self.meal_type.id
        }
        response = self.client.post(f"{self.base_url}/booking", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print("✅ Booking Creation API test passed")
    
    def test_booking_delete(self):
        """Test booking deletion API"""
        print("🧪 Testing Booking Delete API...")
        # Create a booking first
        booking = Booking.objects.create(
            user=self.student_user,
            meal_slot=self.meal_type
        )
        
        self._authenticate_client(self.student_token)
        response = self.client.delete(f"{self.base_url}/booking/{booking.booking_id}")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        print("✅ Booking Delete API test passed")
    
    def test_meal_availability(self):
        """Test meal availability API"""
        print("🧪 Testing Meal Availability API...")
        self._authenticate_client(self.student_token)
        response = self.client.get(f"{self.base_url}/booking/availability")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.json(), list)
        print("✅ Meal Availability API test passed")
    
    def test_booking_history(self):
        """Test booking history API"""
        print("🧪 Testing Booking History API...")
        self._authenticate_client(self.student_token)
        response = self.client.get(f"{self.base_url}/history/{self.student_user.user_id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.json(), list)
        print("✅ Booking History API test passed")

    # ==================== NOTIFICATION TESTS ====================
    
    def test_notification_create(self):
        """Test notification creation API"""
        print("🧪 Testing Notification Creation API...")
        self._authenticate_client(self.admin_token)
        data = {
            "title": "Test Notification",
            "message": "This is a test notification"
        }
        response = self.client.post(f"{self.base_url}/notifications/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print("✅ Notification Creation API test passed")

    # ==================== REPORT TESTS ====================
    
    def test_mess_usage_report(self):
        """Test mess usage report API"""
        print("🧪 Testing Mess Usage Report API...")
        self._authenticate_client(self.admin_token)
        response = self.client.get(f"{self.base_url}/report/mess-usage")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.json(), list)
        print("✅ Mess Usage Report API test passed")
    
    def test_mess_usage_export(self):
        """Test mess usage export API"""
        print("🧪 Testing Mess Usage Export API...")
        self._authenticate_client(self.admin_token)
        response = self.client.get(f"{self.base_url}/report/export")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Mess Usage Export API test passed")
    
    def test_audit_logs(self):
        """Test audit logs API"""
        print("🧪 Testing Audit Logs API...")
        self._authenticate_client(self.admin_token)
        response = self.client.get(f"{self.base_url}/audit-logs")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.json(), list)
        print("✅ Audit Logs API test passed")

    # ==================== TOKEN & ROLE TESTS ====================
    
    def test_token_info(self):
        """Test token info API"""
        print("🧪 Testing Token Info API...")
        self._authenticate_client(self.admin_token)
        response = self.client.get(f"{self.base_url}/token/info")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("user_info", response.json())
        print("✅ Token Info API test passed")
    
    def test_role_based_access(self):
        """Test role-based access control API"""
        print("🧪 Testing Role-Based Access API...")
        self._authenticate_client(self.admin_token)
        response = self.client.get(f"{self.base_url}/test/role-based")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Role-Based Access API test passed")
    
    def test_permission_based_access(self):
        """Test permission-based access control API"""
        print("🧪 Testing Permission-Based Access API...")
        self._authenticate_client(self.admin_token)
        response = self.client.get(f"{self.base_url}/test/permission-based")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Permission-Based Access API test passed")
    
    def test_superuser_only(self):
        """Test superuser-only access API"""
        print("🧪 Testing Superuser-Only API...")
        self._authenticate_client(self.admin_token)
        response = self.client.get(f"{self.base_url}/test/superuser-only")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Superuser-Only API test passed")
    
    def test_student_only(self):
        """Test student-only access API"""
        print("🧪 Testing Student-Only API...")
        self._authenticate_client(self.student_token)
        response = self.client.get(f"{self.base_url}/test/student-only")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Student-Only API test passed")
    
    def test_flexible_permission(self):
        """Test flexible permission API"""
        print("🧪 Testing Flexible Permission API...")
        self._authenticate_client(self.admin_token)
        response = self.client.get(f"{self.base_url}/test/flexible-permission")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Flexible Permission API test passed")
    
    def test_complex_permission(self):
        """Test complex permission API"""
        print("🧪 Testing Complex Permission API...")
        self._authenticate_client(self.admin_token)
        response = self.client.get(f"{self.base_url}/test/complex-permission")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Complex Permission API test passed")

    # ==================== DECORATOR TESTS ====================
    
    def test_decorator_info(self):
        """Test decorator info API"""
        print("🧪 Testing Decorator Info API...")
        response = self.client.get(f"{self.base_url}/decorator/info")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Decorator Info API test passed")
    
    def test_admin_dashboard(self):
        """Test admin dashboard decorator API"""
        print("🧪 Testing Admin Dashboard Decorator API...")
        self._authenticate_client(self.admin_token)
        response = self.client.get(f"{self.base_url}/decorator/admin-dashboard")
        if response.status_code != status.HTTP_200_OK:
            print(f"❌ Admin dashboard failed: {response.status_code}")
            print(f"Response: {response.content}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Admin Dashboard Decorator API test passed")
    
    def test_staff_dashboard(self):
        """Test staff dashboard decorator API"""
        print("🧪 Testing Staff Dashboard Decorator API...")
        self._authenticate_client(self.staff_token)
        response = self.client.get(f"{self.base_url}/decorator/staff-dashboard")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Staff Dashboard Decorator API test passed")
    
    def test_student_portal(self):
        """Test student portal decorator API"""
        print("🧪 Testing Student Portal Decorator API...")
        self._authenticate_client(self.student_token)
        response = self.client.get(f"{self.base_url}/decorator/student-portal")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Student Portal Decorator API test passed")
    
    def test_user_list_decorator(self):
        """Test user list decorator API"""
        print("🧪 Testing User List Decorator API...")
        self._authenticate_client(self.admin_token)
        response = self.client.get(f"{self.base_url}/decorator/user-list")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ User List Decorator API test passed")
    
    def test_user_management(self):
        """Test user management decorator API"""
        print("🧪 Testing User Management Decorator API...")
        self._authenticate_client(self.admin_token)
        response = self.client.post(f"{self.base_url}/decorator/user-management")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ User Management Decorator API test passed")
    
    def test_flexible_access(self):
        """Test flexible access decorator API"""
        print("🧪 Testing Flexible Access Decorator API...")
        self._authenticate_client(self.admin_token)
        response = self.client.get(f"{self.base_url}/decorator/flexible-access")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Flexible Access Decorator API test passed")
    
    def test_user_profile(self):
        """Test user profile decorator API"""
        print("🧪 Testing User Profile Decorator API...")
        self._authenticate_client(self.student_token)
        response = self.client.get(f"{self.base_url}/decorator/user-profile")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ User Profile Decorator API test passed")
    
    def test_decorator_token_info(self):
        """Test decorator token info API"""
        print("🧪 Testing Decorator Token Info API...")
        self._authenticate_client(self.admin_token)
        response = self.client.get(f"{self.base_url}/decorator/token-info")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Decorator Token Info API test passed")
    
    def test_admin_user_delete_decorator(self):
        """Test admin user delete decorator API"""
        print("🧪 Testing Admin User Delete Decorator API...")
        self._authenticate_client(self.admin_token)
        response = self.client.get(f"{self.base_url}/decorator/admin-user-delete")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Admin User Delete Decorator API test passed")
    
    def test_unprotected_endpoint(self):
        """Test unprotected endpoint decorator API"""
        print("🧪 Testing Unprotected Endpoint Decorator API...")
        response = self.client.get(f"{self.base_url}/decorator/unprotected")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        print("✅ Unprotected Endpoint Decorator API test passed")

    # ==================== ERROR HANDLING TESTS ====================
    
    def test_invalid_login(self):
        """Test invalid login credentials"""
        print("🧪 Testing Invalid Login...")
        data = {
            "phone": "+919876543221",
            "password": "wrongpassword"
        }
        response = self.client.post(f"{self.base_url}/auth/student/login/", data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        print("✅ Invalid Login test passed")
    
    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        print("🧪 Testing Unauthorized Access...")
        response = self.client.get(f"{self.base_url}/users/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        print("✅ Unauthorized Access test passed")
    
    def test_invalid_user_id(self):
        """Test access with invalid user ID"""
        print("🧪 Testing Invalid User ID...")
        self._authenticate_client(self.student_token)
        response = self.client.get(f"{self.base_url}/user/99999/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        print("✅ Invalid User ID test passed")

    def tearDown(self):
        """Clean up after each test"""
        # Clean up any created objects
        pass


def run_all_tests():
    """Function to run all tests with nice formatting"""
    print("🚀 Starting Comprehensive API Test Suite...")
    print("=" * 60)
    
    # Import and run tests
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    
    # Run the tests
    from django.test.utils import get_runner
    from django.conf import settings
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    
    # Run all tests in the test file
    failures = test_runner.run_tests(["test_all_apis"])
    
    print("=" * 60)
    if failures:
        print(f"❌ {failures} test(s) failed")
    else:
        print("✅ All tests passed successfully!")
    
    return failures


if __name__ == "__main__":
    # Set up Django settings
    import os
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    django.setup()
    
    # Run the tests
    run_all_tests() 