from django.urls import path
from . import views
from .views import StudentLoginView, MessListCreateView, MessDetailView

urlpatterns = [
    path('', views.health_check),
    path('home/', views.home),
    path('auth/student/login', StudentLoginView.as_view()),
    path('mess', MessListCreateView.as_view()),
    path('mess/<int:mess_id>', MessDetailView.as_view()),
]

