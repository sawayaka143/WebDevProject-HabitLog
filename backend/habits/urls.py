from django.urls import path
from .views import (
    login_view,
    ProfileAPIView,
    PasswordChangeAPIView,
    TaskListCreateAPIView,
    TaskDetailAPIView,
    TaskDetailByFilenameAPIView,
    HabitListCreateAPIView,
    HabitDetailAPIView,
    LogListAPIView,
    ReminderListCreateAPIView,
    ReminderDetailAPIView,
)

urlpatterns = [
    path('auth/login/', login_view),
    path('auth/profile/', ProfileAPIView.as_view()),
    path('auth/change-password/', PasswordChangeAPIView.as_view()),

    path('tasks/', TaskListCreateAPIView.as_view()),
    path('tasks/<uuid:pk>/', TaskDetailAPIView.as_view()),
    path('tasks/<str:filename>/', TaskDetailByFilenameAPIView.as_view()),

    path('habits/', HabitListCreateAPIView.as_view()),
    path('habits/<int:pk>/', HabitDetailAPIView.as_view()),

    path('logs/', LogListAPIView.as_view()),

    path('reminders/', ReminderListCreateAPIView.as_view()),
    path('reminders/<int:pk>/', ReminderDetailAPIView.as_view()),
]