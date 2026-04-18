from django.contrib import admin
from .models import Task, Habit, LogEntry

admin.site.register(Task)
admin.site.register(Habit)
admin.site.register(LogEntry)