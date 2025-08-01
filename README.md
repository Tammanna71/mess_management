# Mess Management System

## Overview
The Mess Management System is a web-based application designed to streamline and automate the management of mess facilities in institutional settings. Built with Django and PostgreSQL, the system provides robust features for user management, meal booking, coupon generation, notifications, and reporting.

## Features
- **User Registration & Authentication:** Secure sign-up and login for students and administrators, with role-based access control.
- **Mess & Meal Slot Management:** Admins can create, update, and monitor mess facilities and meal timings.
- **Booking & Coupon Management:** Students can reserve meals; admins can generate and validate meal coupons.
- **Notifications & Reporting:** Real-time notifications and comprehensive reports for admins and users.
- **API Testing & Documentation:** Automated tests and a Postman collection for easy API exploration.

## Technology Stack
- **Backend:** Django (Python)
- **Database:** PostgreSQL (managed via Docker)
- **Containerization:** Docker & Docker Compose

## Project Structure
```
├── backend/                # Django project configuration
├── core/                   # Main business logic (models, views, serializers, permissions, URLs)
├── db.sqlite3              # (Legacy/optional) SQLite database file
├── docker-compose.yml      # Docker Compose setup for PostgreSQL
├── manage.py               # Django management script
├── test-api.js             # Automated API tests (Node.js/Axios)
├── Mess Management System API.postman_collection.json # Postman API collection
```

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)
- Python 3.8+
- pydantic<2.0

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd mess_management_system
   ```

2. **Start PostgreSQL with Docker Compose:**
   ```bash
   docker-compose up -d
   ```
   This will start a PostgreSQL database on port 5432 with the credentials specified in `docker-compose.yml`.

3. **Configure Django to use PostgreSQL:**
   - Update your `backend/settings.py` to use the following database settings:
     ```python
     DATABASES = {
         'default': {
             'ENGINE': 'django.db.backends.postgresql',
             'NAME': 'messdatabase',
             'USER': 'admin',
             'PASSWORD': '12345',
             'HOST': 'localhost',
             'PORT': '5432',
         }
     }
     ```

4. **Install Python dependencies:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

5. **Apply migrations and create a superuser:**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Run the Django development server:**
   ```bash
   python manage.py runserver
   ```

7. **Access the application:**
   - API: [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)
   - Admin: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

## API Testing
- Use the provided Postman collection (`Mess Management System API.postman_collection.json`) or run `test-api.js` for automated endpoint testing.

## License
This project is for educational and institutional use. Modify and extend as needed for your organization. 