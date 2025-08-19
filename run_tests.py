#!/usr/bin/env python3
"""
Simple script to run the comprehensive API test suite
"""

import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def run_api_tests():
    """Run the comprehensive API test suite"""
    print("🚀 Starting Mess Management API Test Suite")
    print("=" * 60)
    
    try:
        # Import and run the test suite
        from test_all_apis import MessManagementAPITestSuite
        
        # Create test instance and run all tests
        test_suite = MessManagementAPITestSuite()
        test_suite.setUp()
        
        # Get all test methods
        test_methods = [method for method in dir(test_suite) if method.startswith('test_')]
        
        passed = 0
        failed = 0
        
        print(f"📋 Running {len(test_methods)} tests...")
        print()
        
        for test_method in test_methods:
            try:
                print(f"🧪 Running {test_method}...")
                getattr(test_suite, test_method)()
                passed += 1
                print(f"✅ {test_method} passed")
            except Exception as e:
                failed += 1
                print(f"❌ {test_method} failed: {str(e)}")
            print()
        
        print("=" * 60)
        print(f"📊 Test Results:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed == 0:
            print("🎉 All tests passed successfully!")
        else:
            print(f"⚠️  {failed} test(s) failed. Please check the errors above.")
        
        return failed == 0
        
    except Exception as e:
        print(f"❌ Error running tests: {str(e)}")
        return False

if __name__ == "__main__":
    success = run_api_tests()
    sys.exit(0 if success else 1) 