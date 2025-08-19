# Mess Management System - Frontend API Integration Guide

## Overview
This guide provides comprehensive documentation for frontend developers to integrate with the Mess Management System backend APIs. The system supports role-based access control with JWT authentication and provides endpoints for managing users, messes, bookings, coupons, and more.

## Base URL
```
http://localhost:8000/api/
```

## Authentication
The system uses JWT (JSON Web Token) authentication. All protected endpoints require a valid JWT token in the Authorization header.

### Authorization Header Format
```
Authorization: Bearer <your_jwt_token>
```

## User Roles & Permissions
- **Student**: Can book meals, view their coupons, manage their profile
- **Staff**: Can manage mess operations, view reports, create coupons
- **Admin**: Full system access including user management
- **Superuser**: Complete system control

---

## 🔐 Authentication Endpoints

### 1. Student Login
**POST** `/auth/student/login/`
- **Description**: Login for students (non-admin users)
- **Permissions**: Public
- **Request Body**:
```json
{
  "phone": "1234567890",
  "password": "your_password"
}
```
- **Response**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "roll_no": "CS001",
    "room_no": "A101",
    "is_staff": false,
    "is_superuser": false
  },
  "roles": ["student", "user"],
  "permissions": ["user.read", "user.update", "mess.read", "booking.create", "booking.read", "booking.update", "coupon.read"]
}
```

### 2. Admin Login
**POST** `/auth/admin/login/`
- **Description**: Login for admin/staff users
- **Permissions**: Public
- **Request Body**:
```json
{
  "phone": "admin_phone",
  "password": "admin_password"
}
```
- **Response**: Same as student login but with admin roles and permissions

### 3. User Registration
**POST** `/auth/signup/`
- **Description**: Register new student users
- **Permissions**: Public
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "roll_no": "CS001",
  "room_no": "A101",
  "password": "secure_password"
}
```

### 4. Admin User Creation
**POST** `/auth/admin/signup/`
- **Description**: Create new admin users (requires existing admin authentication)
- **Permissions**: Admin only
- **Request Body**: Same as regular registration

### 5. Token Refresh
**POST** `/auth/token/refresh/`
- **Description**: Refresh expired access token
- **Permissions**: Public (with valid refresh token)
- **Request Body**:
```json
{
  "refresh": "your_refresh_token"
}
```

---

## 👥 User Management Endpoints

### 1. List All Users
**GET** `/users/`
- **Description**: Get list of all users
- **Permissions**: Admin only
- **Response**: Array of user objects

### 2. Get User Details
**GET** `/user/<user_id>/`
- **Description**: Get specific user details
- **Permissions**: User can view own profile, admin can view any user
- **Response**: Single user object

### 3. Delete User
**DELETE** `/user/<user_id>/`
- **Description**: Delete a user
- **Permissions**: Admin only

---

## 🏠 Mess Management Endpoints

### 1. List/Create Mess
**GET** `/mess/`
- **Description**: Get list of all messes
- **Permissions**: Authenticated users

**POST** `/mess/`
- **Description**: Create new mess
- **Permissions**: Admin only
- **Request Body**:
```json
{
  "name": "Block A Mess",
  "location": "Block A",
  "availability": true,
  "stock": 100,
  "admin": "Mess Manager Name",
  "current_status": "Open",
  "bookings": 0,
  "menu": "Daily menu items"
}
```

### 2. Mess Details
**GET** `/mess/<mess_id>/`
- **Description**: Get specific mess details
- **Permissions**: Authenticated users

**PUT** `/mess/<mess_id>/`
- **Description**: Update mess details
- **Permissions**: Admin only

**DELETE** `/mess/<mess_id>/`
- **Description**: Delete mess
- **Permissions**: Admin only

---

## 🍽️ Meal Slot Management

### 1. List/Create Meal Slots
**GET** `/meal-slot/`
- **Description**: Get list of all meal slots
- **Permissions**: Authenticated users

**POST** `/meal-slot/`
- **Description**: Create new meal slot
- **Permissions**: Admin only
- **Request Body**:
```json
{
  "mess": 1,
  "type": "Breakfast",
  "available": true,
  "session_time": 8.30,
  "delayed": false,
  "delay_minutes": null,
  "reserve_meal": false
}
```

### 2. Meal Slot Details
**GET** `/meal-slot/<slot_id>/`
- **Description**: Get specific meal slot details
- **Permissions**: Authenticated users

**PUT** `/meal-slot/<slot_id>/`
- **Description**: Update meal slot
- **Permissions**: Admin only

**DELETE** `/meal-slot/<slot_id>/`
- **Description**: Delete meal slot
- **Permissions**: Admin only

---

## 🎫 Coupon Management

### 1. Generate Coupon
**POST** `/coupon/`
- **Description**: Generate coupon for student
- **Permissions**: Admin only
- **Request Body**:
```json
{
  "studentId": 3,
  "messId": 2,
  "meal_type": "Breakfast",
  "session_time": 8.30,
  "location": "Block-A"
}
```

### 2. Validate Coupon
**POST** `/coupon/validate/`
- **Description**: Validate and redeem coupon
- **Permissions**: Authenticated users
- **Request Body**:
```json
{
  "couponId": 123
}
```

### 3. My Coupons
**GET** `/coupons/my/`
- **Description**: Get user's own coupons
- **Permissions**: Authenticated users

---

## 📅 Booking Management

### 1. List/Create Bookings
**GET** `/booking/`
- **Description**: Get bookings (all for admin, own for students)
- **Permissions**: Authenticated users

**POST** `/booking/`
- **Description**: Create new meal booking
- **Permissions**: Authenticated users
- **Request Body**:
```json
{
  "userId": 1,
  "mealSlotId": 5
}
```

### 2. Delete Booking
**DELETE** `/booking/<booking_id>/`
- **Description**: Cancel meal booking
- **Permissions**: User can cancel own booking, admin can cancel any
- **Note**: Cancellation allowed only within 1 hour of booking

### 3. Meal Availability
**GET** `/booking/availability/`
- **Description**: Get available meal slots
- **Permissions**: Authenticated users

### 4. Booking History
**GET** `/history/<userId>/`
- **Description**: Get user's booking history
- **Permissions**: User can view own history, admin can view any user's

---

## 📊 Reports & Analytics

### 1. Mess Usage Report
**GET** `/report/mess-usage/`
- **Description**: Get mess usage statistics
- **Permissions**: Admin only
- **Response**: Mess usage data with total meals and unique users

### 2. Export Report
**GET** `/report/export/`
- **Description**: Export mess usage report as CSV
- **Permissions**: Admin only
- **Response**: CSV file download

### 3. Audit Logs
**GET** `/audit-logs/`
- **Description**: Get system audit logs
- **Permissions**: Admin only

---

## 🔔 Notifications

### 1. List/Create Notifications
**GET** `/notifications/`
- **Description**: Get all notifications
- **Permissions**: Admin only

**POST** `/notifications/`
- **Description**: Create new notification
- **Permissions**: Admin only
- **Request Body**:
```json
{
  "title": "Important Notice",
  "message": "Mess will be closed tomorrow for maintenance"
}
```

---

## 🧪 Testing & Development Endpoints

### 1. Health Check
**GET** `/`
- **Description**: System health check
- **Permissions**: Public
- **Response**: `{"status": "ok"}`

### 2. CORS Test
**GET** `/cors-test/`
- **Description**: Test CORS configuration
- **Permissions**: Public

### 3. Token Info
**GET** `/token/info`
- **Description**: Get current user's token information
- **Permissions**: Authenticated users

### 4. Role Testing
**GET** `/test/role-based`
- **Description**: Test role-based access control
- **Permissions**: Admin/Staff only

**GET** `/test/permission-based`
- **Description**: Test permission-based access control
- **Permissions**: Users with specific permissions

---

## 🔧 JWT Decorator Examples

The system also provides decorator-based endpoints for testing different access levels:

- `/decorator/admin-dashboard` - Admin only
- `/decorator/staff-dashboard` - Admin or Staff
- `/decorator/student-portal` - Students only
- `/decorator/user-management` - Admin only
- `/decorator/flexible-access` - Flexible permission checking

---

## 📝 Data Models

### User Model
```json
{
  "user_id": 1,
  "name": "John Doe",
  "room_no": "A101",
  "phone": "1234567890",
  "email": "john@example.com",
  "roll_no": "CS001",
  "is_active": true,
  "is_staff": false,
  "is_superuser": false,
  "date_joined": "2024-01-01T00:00:00Z"
}
```

### Mess Model
```json
{
  "mess_id": 1,
  "name": "Block A Mess",
  "location": "Block A",
  "availability": true,
  "stock": 100,
  "admin": "Mess Manager",
  "current_status": "Open",
  "bookings": 25,
  "menu": "Daily menu items"
}
```

### Booking Model
```json
{
  "booking_id": 1,
  "user": 1,
  "meal_slot": 5,
  "created_at": "2024-01-01T08:00:00Z",
  "cancelled": false
}
```

### Coupon Model
```json
{
  "c_id": 1,
  "user": 1,
  "mess": 1,
  "session_time": 8.30,
  "location": "Block-A",
  "cancelled": false,
  "created_at": "2024-01-01T00:00:00Z",
  "created_by": "Admin",
  "meal_type": "Breakfast"
}
```

---

## 🚀 Frontend Integration Examples

### 1. Login Flow
```javascript
const login = async (phone, password, isAdmin = false) => {
  const endpoint = isAdmin ? '/auth/admin/login/' : '/auth/student/login/';
  
  try {
    const response = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      // Store tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user_info', JSON.stringify(data.user));
      return data;
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### 2. Authenticated API Call
```javascript
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(`/api${endpoint}`, config);
    
    if (response.status === 401) {
      // Token expired, try to refresh
      await refreshToken();
      // Retry the request
      return apiCall(endpoint, options);
    }
    
    return response;
  } catch (error) {
    console.error('API call failed:', error);
  }
};
```

### 3. Token Refresh
```javascript
const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  
  try {
    const response = await fetch('/api/auth/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    }
  } catch (error) {
    // Refresh failed, redirect to login
    localStorage.clear();
    window.location.href = '/login';
  }
};
```

---

## ⚠️ Important Notes

1. **Token Expiration**: Access tokens expire and need to be refreshed using the refresh token
2. **Role-Based Access**: Different endpoints require different user roles
3. **CORS**: The backend is configured to allow all origins for development
4. **Error Handling**: Always check response status and handle errors appropriately
5. **Validation**: The backend uses both Pydantic and DRF validation for robust data validation

---

## 🔍 Testing APIs

You can test the APIs using:
- **Postman Collection**: `Mess Management System API.postman_collection.json`
- **Health Check**: `GET /` to verify backend is running
- **CORS Test**: `GET /cors-test/` to verify CORS configuration

---

## 📞 Support

For backend-related issues or questions about API integration, refer to:
- Backend code in `/backend/` and `/core/` directories
- Django REST framework documentation
- JWT authentication documentation
