#!/usr/bin/env python
"""
Dummy Data Creation Script for Mess Management System
This script will clean the database and insert comprehensive dummy data.
"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Mess, MealType, Coupon, Menu, Feedback, MessItems, MonthlyAttendance, Organization, Status, Booking, Notification, AuditLog
from django.contrib.auth.hashers import make_password

def clean_database():
    """Clean all existing data from the database"""
    print("🧹 Cleaning existing data...")
    
    # Delete all data in reverse order of dependencies
    AuditLog.objects.all().delete()
    Notification.objects.all().delete()
    Booking.objects.all().delete()
    Coupon.objects.all().delete()
    Menu.objects.all().delete()
    Feedback.objects.all().delete()
    MessItems.objects.all().delete()
    MonthlyAttendance.objects.all().delete()
    MealType.objects.all().delete()
    Mess.objects.all().delete()
    User.objects.all().delete()
    Organization.objects.all().delete()
    Status.objects.all().delete()
    
    print("✅ Database cleaned successfully!")

def create_organizations():
    """Create dummy organizations"""
    print("🏢 Creating organizations...")
    
    org1 = Organization.objects.create(
        name="IIT Bombay",
        location="Powai, Mumbai, Maharashtra",
        admin="Director IITB"
    )
    
    org2 = Organization.objects.create(
        name="IIT Delhi",
        location="Hauz Khas, New Delhi",
        admin="Director IITD"
    )
    
    print(f"✅ Created {Organization.objects.count()} organizations")
    return org1, org2

def create_statuses():
    """Create status objects"""
    print("📊 Creating status objects...")
    
    # Status objects will be created later when we have users and messes
    print("✅ Status objects will be created with users and messes")
    return []

def create_users(org1, org2):
    """Create dummy users including admin and students"""
    print("👥 Creating users...")
    
    # Create Admin User (as specified)
    admin_user = User.objects.create(
        name="Admin User",
        email="admin@mess.com",
        phone="+919328770114",
        password=make_password("admin@123"),
        room_no="A-101",
        roll_no="ADMIN001",
        is_staff=True,
        is_superuser=True
    )
    
    # Create Staff Users
    staff_users = [
        User.objects.create(
            name="Mess Manager",
            email="manager@mess.com",
            phone="+919876543210",
            password=make_password("password123"),
            room_no="B-201",
            roll_no="STAFF001",
            is_staff=True
        ),
        User.objects.create(
            name="Kitchen Supervisor",
            email="kitchen@mess.com",
            phone="+919876543211",
            password=make_password("password123"),
            room_no="B-202",
            roll_no="STAFF002",
            is_staff=True
        )
    ]
    
    # Create Student Users
    student_users = []
    student_names = [
        "Rahul Sharma", "Priya Patel", "Amit Kumar", "Neha Singh",
        "Vikram Verma", "Anjali Gupta", "Rajesh Kumar", "Sneha Reddy",
        "Arjun Mehta", "Zara Khan", "Karan Malhotra", "Ishita Joshi",
        "Aditya Singh", "Maya Sharma", "Rohan Kapoor", "Tanya Verma",
        "Dev Patel", "Aisha Khan", "Vivek Kumar", "Pooja Singh"
    ]
    
    for i, name in enumerate(student_names):
        user = User.objects.create(
            name=name,
            email=f"student{i+1}@iitb.ac.in",
            phone=f"+9198{str(i+100).zfill(7)}",
            password=make_password("password123"),
            room_no=f"{chr(65 + (i % 4))}-{100 + (i % 20)}",
            roll_no=f"2023{str(i+1).zfill(3)}"
        )
        student_users.append(user)
    
    print(f"✅ Created {User.objects.count()} users:")
    print(f"   - 1 Admin user")
    print(f"   - {len(staff_users)} Staff users")
    print(f"   - {len(student_users)} Student users")
    
    return admin_user, staff_users, student_users

def create_messes(org1, org2):
    """Create dummy mess facilities"""
    print("🏠 Creating mess facilities...")
    
    messes = [
        Mess.objects.create(
            name="Hostel 1 Mess",
            location="Block A, Ground Floor",
            availability=True,
            stock=200,
            admin="Ramesh Kumar",
            current_status="Active",
            bookings=0,
            menu="Breakfast, Lunch, Dinner"
        ),
        Mess.objects.create(
            name="Hostel 2 Mess",
            location="Block B, Ground Floor",
            availability=True,
            stock=150,
            admin="Suresh Patel",
            current_status="Active",
            bookings=0,
            menu="Breakfast, Lunch, Dinner"
        ),
        Mess.objects.create(
            name="Hostel 3 Mess",
            location="Block C, Ground Floor",
            availability=True,
            stock=180,
            admin="Mahesh Singh",
            current_status="Active",
            bookings=0,
            menu="Breakfast, Lunch, Dinner"
        ),
        Mess.objects.create(
            name="Delhi Campus Mess",
            location="Main Building, Floor 1",
            availability=True,
            stock=120,
            admin="Amit Sharma",
            current_status="Active",
            bookings=0,
            menu="Breakfast, Lunch, Dinner"
        )
    ]
    
    print(f"✅ Created {Mess.objects.count()} mess facilities")
    return messes

def create_meal_types(messes):
    """Create meal types for each mess"""
    print("🍽️ Creating meal types...")
    
    meal_types = []
    meal_names = ["Breakfast", "Lunch", "Dinner"]
    session_times = [8.0, 13.0, 20.0]  # 8 AM, 1 PM, 8 PM
    
    for mess in messes:
        for i, meal_name in enumerate(meal_names):
            meal_type = MealType.objects.create(
                mess=mess,
                type=meal_name,
                session_time=session_times[i],
                available=True,
                delayed=False,
                delay_minutes=None,
                reserve_meal=False
            )
            meal_types.append(meal_type)
    
    print(f"✅ Created {MealType.objects.count()} meal types")
    return meal_types

def create_menus(meal_types):
    """Create menu items for meal types"""
    print("📋 Creating menu items...")
    
    breakfast_items = ["Bread & Butter", "Eggs", "Milk", "Cereal", "Fruits"]
    lunch_items = ["Rice", "Dal", "Vegetables", "Roti", "Curd", "Salad"]
    dinner_items = ["Rice", "Dal", "Vegetables", "Roti", "Curd", "Salad"]
    
    for meal_type in meal_types:
        if meal_type.type == "Breakfast":
            items = breakfast_items
        else:
            items = lunch_items if meal_type.type == "Lunch" else dinner_items
        
        for item_name in items:
            Menu.objects.create(
                mess=meal_type.mess,
                session_time=str(meal_type.session_time),
                name=f"{meal_type.type} Menu",
                location=meal_type.mess.location,
                item=item_name,
                meal_type=meal_type.type
            )
    
    print(f"✅ Created {Menu.objects.count()} menu items")

def create_bookings(meal_types, student_users):
    """Create dummy bookings"""
    print("📅 Creating bookings...")
    
    # Create bookings for different meal types (not multiple bookings per user per meal type)
    booking_count = 0
    
    for i, meal_type in enumerate(meal_types):
        # Create bookings for different students for each meal type
        num_bookings = min(10, len(student_users))  # Max 10 bookings per meal type
        
        for j in range(num_bookings):
            student = student_users[j % len(student_users)]
            
            # Check if booking already exists
            if not Booking.objects.filter(user=student, meal_slot=meal_type).exists():
                # Create booking
                booking = Booking.objects.create(
                    user=student,
                    meal_slot=meal_type,
                    cancelled=False,
                    created_at=timezone.now() - timedelta(days=j)
                )
                booking_count += 1
    
    print(f"✅ Created {booking_count} bookings")

def create_coupons(messes, student_users):
    """Create dummy coupons"""
    print("🎫 Creating coupons...")
    
    for mess in messes:
        for i, student in enumerate(student_users[:5]):  # Create coupons for first 5 students
            Coupon.objects.create(
                user=student,
                mess=mess,
                meal_type="Lunch",
                session_time=13.0,
                location=mess.location,
                created_by="Admin User",
                cancelled=False
            )
    
    print(f"✅ Created {Coupon.objects.count()} coupons")

def create_feedback(student_users, messes):
    """Create dummy feedback"""
    print("💬 Creating feedback...")
    
    feedback_texts = [
        "Great food quality!",
        "Service could be improved",
        "Excellent variety in menu",
        "Clean and hygienic environment",
        "Good value for money",
        "Staff is very helpful",
        "Food is sometimes cold",
        "Overall satisfactory experience"
    ]
    
    for i, student in enumerate(student_users[:8]):
        Feedback.objects.create(
            user=student,
            result=feedback_texts[i],
            issued_to="Mess Management"
        )
    
    print(f"✅ Created {Feedback.objects.count()} feedback entries")

def create_notifications(admin_user, student_users):
    """Create dummy notifications"""
    print("🔔 Creating notifications...")
    
    notifications = [
        "Mess timings changed for this week",
        "New menu items added",
        "Holiday mess schedule announced",
        "Maintenance work in mess kitchen",
        "Special dinner on Saturday",
        "Feedback survey is now open",
        "Mess bill payment due",
        "New mess staff joined"
    ]
    
    for i, message in enumerate(notifications):
        Notification.objects.create(
            title=f"Mess Update {i+1}",
            message=message
        )
    
    print(f"✅ Created {Notification.objects.count()} notifications")

def create_audit_logs(admin_user, student_users):
    """Create dummy audit logs"""
    print("📝 Creating audit logs...")
    
    actions = [
        "User logged in",
        "Booking created",
        "Coupon generated",
        "Feedback submitted",
        "Menu updated",
        "User registered",
        "Booking cancelled",
        "Payment processed"
    ]
    
    for i, action in enumerate(actions):
        AuditLog.objects.create(
            action=action,
            performed_by=admin_user if i % 2 == 0 else student_users[i % len(student_users)],
            details=f"Action performed: {action}"
        )
    
    print(f"✅ Created {AuditLog.objects.count()} audit logs")

def main():
    """Main function to create all dummy data"""
    print("🚀 Starting dummy data creation...")
    print("=" * 50)
    
    try:
        # Clean existing data
        clean_database()
        
        # Create base data
        org1, org2 = create_organizations()
        statuses = create_statuses()
        
        # Create users
        admin_user, staff_users, student_users = create_users(org1, org2)
        
        # Create mess facilities
        messes = create_messes(org1, org2)
        
        # Create meal types
        meal_types = create_meal_types(messes)
        
        # Create menu items
        create_menus(meal_types)
        
        # Create bookings
        create_bookings(meal_types, student_users)
        
        # Create coupons
        create_coupons(messes, student_users)
        
        # Create feedback
        create_feedback(student_users, messes)
        
        # Create notifications
        create_notifications(admin_user, student_users)
        
        # Create audit logs
        create_audit_logs(admin_user, student_users)
        
        print("=" * 50)
        print("🎉 Dummy data creation completed successfully!")
        print("\n📊 Summary:")
        print(f"   - Organizations: {Organization.objects.count()}")
        print(f"   - Users: {User.objects.count()}")
        print(f"   - Messes: {Mess.objects.count()}")
        print(f"   - Meal Types: {MealType.objects.count()}")
        print(f"   - Menu Items: {Menu.objects.count()}")
        print(f"   - Bookings: {Booking.objects.count()}")
        print(f"   - Coupons: {Coupon.objects.count()}")
        print(f"   - Feedback: {Feedback.objects.count()}")
        print(f"   - Notifications: {Notification.objects.count()}")
        print(f"   - Audit Logs: {AuditLog.objects.count()}")
        
        print("\n🔑 Admin Login Credentials:")
        print("   - Phone: +919328770114")
        print("   - Password: tamni@123")
        print("   - Email: admin@mess.com")
        
        print("\n👥 Sample Student Login Credentials:")
        print("   - Phone: +919876543210")
        print("   - Password: password123")
        print("   - Email: student1@iitb.ac.in")
        
        print("\n✅ You can now test all features of the application!")
        
    except Exception as e:
        print(f"❌ Error creating dummy data: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 