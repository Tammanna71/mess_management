#!/usr/bin/env python3
"""
Role-Based JWT Token Demonstration Script

This script demonstrates the enhanced JWT tokens with role-based authentication
for the Mess Management System.

Usage:
    python role_based_jwt_demo.py

Features Demonstrated:
- Role-based token generation
- Permission-based access control
- Token payload structure
- Role hierarchy
"""

import json
import jwt
from datetime import datetime

def decode_jwt_token(token):
    """
    Decode JWT token to show its contents (without verification for demo).
    """
    try:
        # Split the token to get the payload part
        parts = token.split('.')
        if len(parts) != 3:
            return "Invalid token format"
        
        # Decode the payload (second part)
        import base64
        payload = parts[1]
        # Add padding if needed
        payload += '=' * (4 - len(payload) % 4)
        decoded = base64.b64decode(payload)
        return json.loads(decoded.decode('utf-8'))
    except Exception as e:
        return f"Error decoding token: {e}"

def print_token_info(token_type, token, user_info):
    """
    Print formatted token information.
    """
    print(f"\n{'='*60}")
    print(f"🔐 {token_type.upper()} TOKEN")
    print(f"{'='*60}")
    
    print(f"📋 Token: {token[:50]}...")
    print(f"👤 User: {user_info['name']} ({user_info['email']})")
    print(f"🆔 User ID: {user_info['user_id']}")
    print(f"📱 Phone: {user_info['phone']}")
    print(f"🎭 Roles: {', '.join(user_info['roles'])}")
    print(f"🔑 Permissions: {len(user_info['permissions'])} total")
    
    # Show first few permissions
    if user_info['permissions']:
        print(f"   📝 Sample permissions: {', '.join(user_info['permissions'][:5])}")
        if len(user_info['permissions']) > 5:
            print(f"   ... and {len(user_info['permissions']) - 5} more")
    
    print(f"\n🔍 DECODED TOKEN PAYLOAD:")
    decoded = decode_jwt_token(token)
    if isinstance(decoded, dict):
        for key, value in decoded.items():
            if key == 'permissions' and isinstance(value, list):
                print(f"   {key}: {len(value)} permissions")
            elif key == 'roles' and isinstance(value, list):
                print(f"   {key}: {', '.join(value)}")
            elif key in ['exp', 'iat']:
                # Convert timestamp to readable date
                dt = datetime.fromtimestamp(value)
                print(f"   {key}: {dt.strftime('%Y-%m-%d %H:%M:%S')}")
            else:
                print(f"   {key}: {value}")
    else:
        print(f"   {decoded}")

def demonstrate_role_hierarchy():
    """
    Demonstrate the role hierarchy and permissions.
    """
    print(f"\n{'='*60}")
    print(f"🏗️  ROLE HIERARCHY & PERMISSIONS")
    print(f"{'='*60}")
    
    roles_hierarchy = {
        "superuser": {
            "description": "Full system access",
            "permissions": [
                "user.create", "user.read", "user.update", "user.delete",
                "mess.create", "mess.read", "mess.update", "mess.delete",
                "booking.create", "booking.read", "booking.update", "booking.delete",
                "coupon.create", "coupon.read", "coupon.update", "coupon.delete",
                "report.read", "report.export", "audit.read"
            ]
        },
        "admin": {
            "description": "Administrative access",
            "permissions": [
                "user.read", "user.update",
                "mess.create", "mess.read", "mess.update", "mess.delete",
                "booking.read", "booking.update", "booking.delete",
                "coupon.create", "coupon.read", "coupon.update", "coupon.delete",
                "report.read", "report.export", "audit.read"
            ]
        },
        "staff": {
            "description": "Staff access",
            "permissions": [
                "user.read",
                "mess.read", "mess.update",
                "booking.read", "booking.update",
                "coupon.create", "coupon.read", "coupon.update",
                "report.read"
            ]
        },
        "student": {
            "description": "Student access",
            "permissions": [
                "user.read", "user.update",
                "mess.read",
                "booking.create", "booking.read", "booking.update",
                "coupon.read"
            ]
        }
    }
    
    for role, info in roles_hierarchy.items():
        print(f"\n🎭 {role.upper()}")
        print(f"   📝 {info['description']}")
        print(f"   🔑 Permissions ({len(info['permissions'])}):")
        for perm in info['permissions']:
            print(f"      • {perm}")

def demonstrate_api_endpoints():
    """
    Demonstrate which API endpoints are accessible to different roles.
    """
    print(f"\n{'='*60}")
    print(f"🌐 API ENDPOINT ACCESS BY ROLE")
    print(f"{'='*60}")
    
    endpoints = {
        "superuser": [
            "All endpoints",
            "User management (CRUD)",
            "Mess management (CRUD)",
            "Booking management (CRUD)",
            "Coupon management (CRUD)",
            "Reports & exports",
            "Audit logs",
            "System administration"
        ],
        "admin": [
            "User management (Read/Update)",
            "Mess management (CRUD)",
            "Booking management (Read/Update/Delete)",
            "Coupon management (CRUD)",
            "Reports & exports",
            "Audit logs"
        ],
        "staff": [
            "User management (Read only)",
            "Mess management (Read/Update)",
            "Booking management (Read/Update)",
            "Coupon management (Create/Read/Update)",
            "Reports (Read only)"
        ],
        "student": [
            "Own profile (Read/Update)",
            "Mess information (Read only)",
            "Own bookings (Create/Read/Update)",
            "Own coupons (Read only)",
            "Basic authentication"
        ]
    }
    
    for role, access in endpoints.items():
        print(f"\n🎭 {role.upper()}")
        for endpoint in access:
            print(f"   ✅ {endpoint}")

def main():
    """
    Main demonstration function.
    """
    print("🚀 ROLE-BASED JWT TOKEN DEMONSTRATION")
    print("=" * 60)
    print("This script demonstrates the enhanced JWT tokens with role-based")
    print("authentication for the Mess Management System.")
    
    # Example tokens (these would be generated by the actual system)
    example_tokens = {
        "superuser": {
            "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUzNTEwNzQ5LCJpYXQiOjE3NTM1MDg5NDksImp0aSI6IjU4ZmQ1ZTAyZjViMjRmMjlhOTM2MWFhNDE1OTk2YTgzIiwidXNlcl9pZCI6MTIsIm5hbWUiOiJTdXBlciBBZG1pbiIsImVtYWlsIjoic3VwZXJhZG1pbkBleGFtcGxlLmNvbSIsInBob25lIjoiKzEtNTU1LTEyMy00NTY3Iiwicm9sZXMiOlsic3VwZXJ1c2VyIiwiYWRtaW4iLCJzdGFmZiIsInVzZXIiXSwiaXNfc3RhZmYiOnRydWUsImlzX3N1cGVydXNlciI6dHJ1ZSwicGVybWlzc2lvbnMiOlsidXNlci5jcmVhdGUiLCJ1c2VyLnJlYWQiLCJ1c2VyLnVwZGF0ZSIsInVzZXIuZGVsZXRlIiwibWVzcy5jcmVhdGUiLCJtZXNzLnJlYWQiLCJtZXNzLnVwZGF0ZSIsIm1lc3MuZGVsZXRlIiwiYm9va2luZy5jcmVhdGUiLCJib29raW5nLnVwZGF0ZSIsImJvb2tpbmcuZGVsZXRlIiwiY291cG9uLmNyZWF0ZSIsImNvdXBvbi5yZWFkIiwiY291cG9uLnVwZGF0ZSIsImNvdXBvbi5kZWxldGUiLCJyZXBvcnQucmVhZCIsInJlcG9ydC5leHBvcnQiLCJhdWRpdC5yZWFkIiwiYXV0aC5sb2dpbiIsImF1dGgubG9nb3V0IiwiYXV0aC5yZWZyZXNoIl19.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8",
            "user_info": {
                "user_id": 12,
                "name": "Super Admin",
                "email": "superadmin@example.com",
                "phone": "+1-555-123-4567",
                "roles": ["superuser", "admin", "staff", "user"],
                "permissions": [
                    "user.create", "user.read", "user.update", "user.delete",
                    "mess.create", "mess.read", "mess.update", "mess.delete",
                    "booking.create", "booking.read", "booking.update", "booking.delete",
                    "coupon.create", "coupon.read", "coupon.update", "coupon.delete",
                    "report.read", "report.export", "audit.read",
                    "auth.login", "auth.logout", "auth.refresh"
                ]
            }
        },
        "admin": {
            "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUzNTEwNzQ5LCJpYXQiOjE3NTM1MDg5NDksImp0aSI6IjU4ZmQ1ZTAyZjViMjRmMjlhOTM2MWFhNDE1OTk2YTgzIiwidXNlcl9pZCI6MTMsIm5hbWUiOiJBZG1pbiBVc2VyIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInBob25lIjoiKzEtNTU1LTk4Ny02NTQzIiwicm9sZXMiOlsibm9ybWFsIiwiYWRtaW4iLCJ1c2VyIl0sImlzX3N0YWZmIjp0cnVlLCJpc19zdXBlcnVzZXIiOmZhbHNlLCJwZXJtaXNzaW9ucyI6WyJ1c2VyLnJlYWQiLCJ1c2VyLnVwZGF0ZSIsIm1lc3MuY3JlYXRlIiwibWVzcy5yZWFkIiwibWVzcy51cGRhdGUiLCJtZXNzLmRlbGV0ZSIsImJvb2tpbmcucmVhZCIsImJvb2tpbmcudXBkYXRlIiwiYm9va2luZy5kZWxldGUiLCJjb3Vwb24uY3JlYXRlIiwiY291cG9uLnJlYWQiLCJjb3Vwb24udXBkYXRlIiwiY291cG9uLmRlbGV0ZSIsInJlcG9ydC5yZWFkIiwicmVwb3J0LmV4cG9ydCIsImF1ZGl0LnJlYWQiLCJhdXRoLmxvZ2luIiwiYXV0aC5sb2dvdXQiLCJhdXRoLnJlZnJlc2giXX0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8",
            "user_info": {
                "user_id": 13,
                "name": "Admin User",
                "email": "admin@example.com",
                "phone": "+1-555-987-6543",
                "roles": ["admin", "user"],
                "permissions": [
                    "user.read", "user.update",
                    "mess.create", "mess.read", "mess.update", "mess.delete",
                    "booking.read", "booking.update", "booking.delete",
                    "coupon.create", "coupon.read", "coupon.update", "coupon.delete",
                    "report.read", "report.export", "audit.read",
                    "auth.login", "auth.logout", "auth.refresh"
                ]
            }
        },
        "student": {
            "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUzNTEwNzQ5LCJpYXQiOjE3NTM1MDg5NDksImp0aSI6IjU4ZmQ1ZTAyZjViMjRmMjlhOTM2MWFhNDE1OTk2YTgzIiwidXNlcl9pZCI6MTQsIm5hbWUiOiJKb2huIERvZSIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJwaG9uZSI6Iis5MS05ODc2NS00MzIxMCIsInJvbGVzIjpbInN0dWRlbnQiLCJ1c2VyIl0sImlzX3N0YWZmIjpmYWxzZSwiaXNfc3VwZXJ1c2VyIjpmYWxzZSwicGVybWlzc2lvbnMiOlsidXNlci5yZWFkIiwidXNlci51cGRhdGUiLCJtZXNzLnJlYWQiLCJib29raW5nLmNyZWF0ZSIsImJvb2tpbmcucmVhZCIsImJvb2tpbmcudXBkYXRlIiwiY291cG9uLnJlYWQiLCJhdXRoLmxvZ2luIiwiYXV0aC5sb2dvdXQiLCJhdXRoLnJlZnJlc2giXX0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8",
            "user_info": {
                "user_id": 14,
                "name": "John Doe",
                "email": "john.doe@example.com",
                "phone": "+91-98765-43210",
                "roles": ["student", "user"],
                "permissions": [
                    "user.read", "user.update",
                    "mess.read",
                    "booking.create", "booking.read", "booking.update",
                    "coupon.read",
                    "auth.login", "auth.logout", "auth.refresh"
                ]
            }
        }
    }
    
    # Demonstrate each user type
    for user_type, data in example_tokens.items():
        print_token_info(user_type, data["token"], data["user_info"])
    
    # Demonstrate role hierarchy
    demonstrate_role_hierarchy()
    
    # Demonstrate API endpoint access
    demonstrate_api_endpoints()
    
    print(f"\n{'='*60}")
    print(f"🎉 DEMONSTRATION COMPLETE")
    print(f"{'='*60}")
    print("Key Features Demonstrated:")
    print("✅ Role-based token generation")
    print("✅ Permission-based access control")
    print("✅ Token payload with user info")
    print("✅ Role hierarchy and inheritance")
    print("✅ API endpoint access control")
    print("✅ Enhanced security with role validation")

if __name__ == "__main__":
    main() 