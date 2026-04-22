import logging
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Task, Habit, LogEntry, Reminder
from .serializers import (
    LoginSerializer,
    UserSerializer,
    ProfileUpdateSerializer,
    PasswordChangeSerializer,
    TaskSerializer,
    HabitSerializer,
    LogEntrySerializer,
    ReminderSerializer,
)


def create_log(user, action):
    LogEntry.objects.create(user=user, action=action)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    username = serializer.validated_data['username']
    password = serializer.validated_data['password']

    # log attempt (do not log passwords)
    logger = logging.getLogger(__name__)
    remote = request.META.get('REMOTE_ADDR')
    logger.info(f"Login attempt for username='{username}' from {remote}")

    user = authenticate(username=username, password=password)
    if not user:
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    return Response({
        'token': access_token,
        'user': UserSerializer(user).data
    }, status=status.HTTP_200_OK)


class ProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
            if not request.user.check_password(old_password):
                return Response({'detail': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
            request.user.set_password(new_password)
            request.user.save()
            create_log(request.user, '[USER] PASSWORD CHANGED')
            return Response({'detail': 'Password changed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tasks = Task.objects.filter(user=request.user).order_by('-created_at')
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            task = serializer.save(user=request.user)
            create_log(request.user, f'[TASK] CREATE: {task.filename}')
            return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        try:
            return Task.objects.get(pk=pk, user=request.user)
        except Task.DoesNotExist:
            return None

    def patch(self, request, pk):
        task = self.get_object(request, pk)
        if not task:
            return Response({'detail': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

        old_status = task.status
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            updated_task = serializer.save()
            if 'status' in serializer.validated_data and serializer.validated_data['status'] == 'done' and old_status != 'done':
                create_log(request.user, f'[TASK] DONE: {updated_task.filename}')
            else:
                create_log(request.user, f'[TASK] UPDATE: {updated_task.filename}')
            return Response(TaskSerializer(updated_task).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        task = self.get_object(request, pk)
        if not task:
            return Response({'detail': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

        filename = task.filename
        task.delete()
        create_log(request.user, f'[TASK] DELETE: {filename}')
        return Response(status=status.HTTP_204_NO_CONTENT)


class TaskDetailByFilenameAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, filename):
        try:
            return Task.objects.get(filename=filename, user=request.user)
        except Task.DoesNotExist:
            return None

    def patch(self, request, filename):
        task = self.get_object(request, filename)
        if not task:
            return Response({'detail': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

        old_status = task.status
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            updated_task = serializer.save()
            if 'status' in serializer.validated_data and serializer.validated_data['status'] == 'done' and old_status != 'done':
                create_log(request.user, f'[TASK] DONE: {updated_task.filename}')
            else:
                create_log(request.user, f'[TASK] UPDATE: {updated_task.filename}')
            return Response(TaskSerializer(updated_task).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, filename):
        task = self.get_object(request, filename)
        if not task:
            return Response({'detail': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

        task.delete()
        create_log(request.user, f'[TASK] DELETE: {filename}')
        return Response(status=status.HTTP_204_NO_CONTENT)


class HabitListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        habits = Habit.objects.filter(user=request.user).order_by('id')
        serializer = HabitSerializer(habits, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = HabitSerializer(data=request.data)
        if serializer.is_valid():
            habit = serializer.save(user=request.user)
            create_log(request.user, f'[HABIT] ADD: {habit.name}()')
            return Response(HabitSerializer(habit).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HabitDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        try:
            return Habit.objects.get(pk=pk, user=request.user)
        except Habit.DoesNotExist:
            return None

    def patch(self, request, pk):
        habit = self.get_object(request, pk)
        if not habit:
            return Response({'detail': 'Habit not found'}, status=status.HTTP_404_NOT_FOUND)

        old_days = habit.days[:] if habit.days else [False, False, False, False, False, False, False]
        serializer = HabitSerializer(habit, data=request.data, partial=True)
        if serializer.is_valid():
            updated_habit = serializer.save()

            new_days = updated_habit.days
            changed_index = None
            if isinstance(old_days, list) and isinstance(new_days, list) and len(old_days) == len(new_days):
                for i, (old, new) in enumerate(zip(old_days, new_days)):
                    if old != new:
                        changed_index = i
                        break

            if changed_index is not None:
                create_log(request.user, f'[HABIT] TOGGLED: {updated_habit.name}() day {changed_index}')
            else:
                create_log(request.user, f'[HABIT] TOGGLED: {updated_habit.name}()')

            return Response(HabitSerializer(updated_habit).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        habit = self.get_object(request, pk)
        if not habit:
            return Response({'detail': 'Habit not found'}, status=status.HTTP_404_NOT_FOUND)

        name = habit.name
        habit.delete()
        create_log(request.user, f'[HABIT] DELETE: {name}()')
        return Response(status=status.HTTP_204_NO_CONTENT)


class LogListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logs = LogEntry.objects.filter(user=request.user).order_by('-time')[:50]
        serializer = LogEntrySerializer(logs, many=True)
        return Response(serializer.data)


class ReminderListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reminders = Reminder.objects.filter(user=request.user).order_by('reminder_time')
        serializer = ReminderSerializer(reminders, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ReminderSerializer(data=request.data)
        if serializer.is_valid():
            reminder = serializer.save(user=request.user)
            create_log(request.user, f'[REMINDER] CREATE: {reminder.message}')
            return Response(ReminderSerializer(reminder).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReminderDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        try:
            return Reminder.objects.get(pk=pk, user=request.user)
        except Reminder.DoesNotExist:
            return None

    def patch(self, request, pk):
        reminder = self.get_object(request, pk)
        if not reminder:
            return Response({'detail': 'Reminder not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReminderSerializer(reminder, data=request.data, partial=True)
        if serializer.is_valid():
            updated_reminder = serializer.save()
            create_log(request.user, f'[REMINDER] UPDATE: {updated_reminder.message}')
            return Response(ReminderSerializer(updated_reminder).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        reminder = self.get_object(request, pk)
        if not reminder:
            return Response({'detail': 'Reminder not found'}, status=status.HTTP_404_NOT_FOUND)

        message = reminder.message
        reminder.delete()
        create_log(request.user, f'[REMINDER] DELETE: {message}')
        return Response(status=status.HTTP_204_NO_CONTENT)