# 🧪 Mess Management API Test Suite

This directory contains comprehensive test files for all APIs in your Mess Management System, similar to Jest testing style but using Django's testing framework.

## 📁 Files

- **`test_all_apis.py`** - Main comprehensive test suite covering all APIs
- **`run_tests.py`** - Simple script to run all tests easily
- **`API_TESTING_README.md`** - This documentation file

## 🚀 Quick Start

### Prerequisites
- Django server running on `http://127.0.0.1:8000/`
- PostgreSQL database running (via Docker)
- All dependencies installed

### Running Tests

#### Method 1: Using the Simple Runner
```bash
python run_tests.py
```

#### Method 2: Using Django's Test Runner
```bash
python manage.py test test_all_apis.MessManagementAPITestSuite
```

#### Method 3: Using pytest (if installed)
```bash
pytest test_all_apis.py -v
```

## 📋 Test Coverage

The test suite covers **ALL** APIs in your core app:

### 🔐 Authentication APIs
- ✅ Student Login
- ✅ Admin Login  
- ✅ Student Registration
- ✅ Admin Creation

### 👥 User Management APIs
- ✅ User List
- ✅ User Detail
- ✅ User Delete

### 🍽️ Mess Management APIs
- ✅ Mess List
- ✅ Mess Creation
- ✅ Mess Detail
- ✅ Mess Update
- ✅ Mess Delete

### ⏰ Meal Slot APIs
- ✅ Meal Slot List
- ✅ Meal Slot Creation
- ✅ Meal Slot Detail
- ✅ Meal Slot Update
- ✅ Meal Slot Delete

### 🎫 Coupon APIs
- ✅ Coupon Generation
- ✅ Coupon Validation
- ✅ My Coupons

### 📅 Booking APIs
- ✅ Booking List
- ✅ Booking Creation
- ✅ Booking Delete
- ✅ Meal Availability
- ✅ Booking History

### 📢 Notification APIs
- ✅ Notification Creation

### 📊 Report APIs
- ✅ Mess Usage Report
- ✅ Mess Usage Export
- ✅ Audit Logs

### 🔑 Token & Role APIs
- ✅ Token Info
- ✅ Role-Based Access
- ✅ Permission-Based Access
- ✅ Superuser-Only Access
- ✅ Student-Only Access
- ✅ Flexible Permission
- ✅ Complex Permission

### 🎭 Decorator APIs
- ✅ Decorator Info
- ✅ Admin Dashboard
- ✅ Staff Dashboard
- ✅ Student Portal
- ✅ User List
- ✅ User Management
- ✅ Flexible Access
- ✅ User Profile
- ✅ Token Info
- ✅ Admin User Delete
- ✅ Unprotected Endpoint

### ⚠️ Error Handling
- ✅ Invalid Login
- ✅ Unauthorized Access
- ✅ Invalid User ID

## 🧪 Test Features

### Jest-like Features
- **Descriptive test names** with emojis for easy identification
- **Setup and teardown** methods for clean test environment
- **Comprehensive assertions** for response status and data
- **Error handling** tests for edge cases
- **Authentication testing** with JWT tokens
- **Role-based access** testing

### Test Data Setup
The test suite automatically creates:
- **Admin User** (superuser with full permissions)
- **Student User** (regular user with student permissions)
- **Staff User** (staff user with limited admin permissions)
- **Test Mess** (sample mess for testing)
- **Test Meal Type** (sample meal slot for testing)

### Authentication
- Tests use JWT tokens for authentication
- Different user roles are tested with appropriate permissions
- Token generation and validation is tested

## 📊 Test Output

When you run the tests, you'll see output like this:

```
🚀 Starting Mess Management API Test Suite
============================================================
📋 Running 45 tests...

🧪 Testing Health Check API...
✅ Health Check API test passed
✅ test_health_check passed

🧪 Testing Student Login API...
✅ Student Login API test passed
✅ test_student_login passed

...

============================================================
📊 Test Results:
✅ Passed: 45
❌ Failed: 0
📈 Success Rate: 100.0%
🎉 All tests passed successfully!
```

## 🔧 Customization

### Adding New Tests
To add tests for new APIs:

1. Add a new test method in `MessManagementAPITestSuite` class
2. Follow the naming convention: `test_<api_name>`
3. Use the existing helper methods:
   - `self._authenticate_client(token)` - for authentication
   - `self.client.get/post/put/delete()` - for API calls
   - `self.assertEqual()` - for assertions

### Example New Test
```python
def test_new_api(self):
    """Test new API endpoint"""
    print("🧪 Testing New API...")
    self._authenticate_client(self.admin_token)
    response = self.client.get(f"{self.base_url}/new-endpoint/")
    self.assertEqual(response.status_code, status.HTTP_200_OK)
    print("✅ New API test passed")
```

### Modifying Test Data
To modify test data, edit the `setUp()` method in `MessManagementAPITestSuite`:

```python
def setUp(self):
    # Modify user data, mess data, etc.
    self.admin_user = User.objects.create_user(
        phone="+919876543210",
        email="admin@test.com",
        name="Admin User",
        # ... other fields
    )
```

## 🐛 Troubleshooting

### Common Issues

1. **Server Not Running**
   ```
   Error: Connection refused
   ```
   **Solution**: Make sure Django server is running on `http://127.0.0.1:8000/`

2. **Database Connection Issues**
   ```
   Error: Database connection failed
   ```
   **Solution**: Ensure PostgreSQL Docker container is running

3. **Import Errors**
   ```
   Error: ModuleNotFoundError
   ```
   **Solution**: Make sure all dependencies are installed and virtual environment is activated

4. **Authentication Errors**
   ```
   Error: 401 Unauthorized
   ```
   **Solution**: Check if JWT tokens are being generated correctly

### Debug Mode
To run tests in debug mode, add this to your test method:
```python
import pdb; pdb.set_trace()  # This will pause execution for debugging
```

## 📈 Performance

- **Test Execution Time**: ~30-60 seconds for all tests
- **Memory Usage**: Minimal (tests clean up after themselves)
- **Database Impact**: Tests use separate test database

## 🎯 Best Practices

1. **Run tests before deploying** any changes
2. **Add tests for new features** as you develop them
3. **Keep test data realistic** but minimal
4. **Use descriptive test names** for easy debugging
5. **Test both success and failure cases**
6. **Test authentication and authorization** thoroughly

## 🔄 Continuous Integration

You can integrate these tests into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run API Tests
  run: |
    python run_tests.py
```

## 📞 Support

If you encounter issues with the tests:
1. Check the troubleshooting section above
2. Ensure your Django server is running
3. Verify database connectivity
4. Check that all dependencies are installed

---

**Happy Testing! 🎉** 