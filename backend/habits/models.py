import uuid
from django.db import models
from django.contrib.auth.models import User


class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('done', 'Done'),
    ]

    TAG_CHOICES = [
        ('work', 'Work'),
        ('personal', 'Personal'),
        ('health', 'Health'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    filename = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    tag = models.CharField(max_length=20, choices=TAG_CHOICES, default='work')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateField()

    def __str__(self):
        return self.filename


class Habit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=255)
    days = models.JSONField(default=list)

    def save(self, *args, **kwargs):
        if not self.days:
            self.days = [False, False, False, False, False, False, False]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class LogEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='logs')
    time = models.DateTimeField(auto_now_add=True)
    action = models.CharField(max_length=255)

    def __str__(self):
        return self.action