import os
import django
import psycopg2

# Set Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

# Setup Django
django.setup()

# Import models after Django setup
from core.models import User

# Create the user via Django ORM
user_email = "riya18@gmail.com"
User.objects.create_user(
    email=user_email,
    password="riya18",
    roll_no="21CE003",
    phone="9991112223",
    room_no="B202",
    name="Riya"
)

# Connect to PostgreSQL database inside Docker
conn = psycopg2.connect(
    dbname="messdatabase",
    user="admin",
    password="12345",  # Replace with actual password if different
    host="db",  # The Docker service name defined in docker-compose
    port="5432"
)

# Verify the user exists using raw SQL
cur = conn.cursor()
cur.execute("SELECT email, roll_no, phone, room_no, name FROM core_user WHERE email = %s", (user_email,))
result = cur.fetchone()

# Cleanup
cur.close()
conn.close()

# Display result
if result:
    print("\n✅ User fetched from real PostgreSQL DB:")
    print("Email:", result[0])
    print("Roll No:", result[1])
    print("Phone:", result[2])
    print("Room No:", result[3])
    print("Name:", result[4])
else:
    print("\n❌ User not found in the database.")
