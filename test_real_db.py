# manual_real_db_test.py

import os
import django
import psycopg2

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mess_management.settings")
django.setup()

from core.models import User

# Create the user using Django ORM
User.objects.create_user(
    email="khushi2505@gmail.com",
    password="khushi2505",
    roll_no="22C002",
    phone="9991023342",
    room_no="B102",
    name="Khushi"
)

# Connect to the real Postgres DB (running in Docker)
conn = psycopg2.connect(
    dbname="messdatabase",
    user="admin",
    password="adminpassword",  # Use your actual password
    host="localhost",          # Or the Docker host alias
    port="5432"
)

cur = conn.cursor()
cur.execute("SELECT * FROM core_user WHERE email = %s", ("khushi2505@gmail.com",))
result = cur.fetchone()
cur.close()
conn.close()

print("\n✅ User Fetched from Real DB:\n", result)
