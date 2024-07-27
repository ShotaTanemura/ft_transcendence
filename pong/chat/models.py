from django.db import models
import uuid
from pong.models import User


class RoomStatus(models.Model):
    room = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    status = models.CharField(max_length=20, blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.status

    class RoomStatusManager(models.Manager):
        def create_room_status(self, status):
            room_status = self.model(status=status)
            room_status.save(using=self._db)
            return room_status

    class Meta:
        db_table = "room_status"
        verbose_name = "room_status"
        verbose_name_plural = "room_status"
        ordering = ["-created_at"]


class Rooms(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(unique=True, blank=False, max_length=20)
    password = models.CharField(max_length=20, blank=True, null=True)
    room_status_id = models.ForeignKey(RoomStatus, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class RoomsManager(models.Manager):
        def create_room(self, name, password):
            room = self.model(name=name, password=password)
            room.save(using=self._db)
            return room

        def get_rooms(self):
            rooms = self.model.objects.all()
            return rooms

    class Meta:
        db_table = "rooms"
        verbose_name = "room"
        verbose_name_plural = "rooms"
        ordering = ["-created_at"]


class UserRooms(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    room_id = models.ForeignKey(Rooms, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class UserRoomsManager(models.Manager):
        def create_user_room(self, user_id, room_id):
            user_room = self.model(user_id=user_id, room_id=room_id)
            user_room.save(using=self._db)
            return user_room

    class Meta:
        db_table = "user_rooms"
        verbose_name = "user_room"
        verbose_name_plural = "user_rooms"
        ordering = ["-created_at"]


class Messages(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    room_id = models.ForeignKey(Rooms, on_delete=models.CASCADE)
    message = models.TextField(blank=False, null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class MessagesManager(models.Manager):
        def create_message(self, user_id, room_id, message):
            message = self.model(user_id=user_id, room_id=room_id, message=message)
            message.save(using=self._db)
            return message

    class Meta:
        db_table = "messages"
        verbose_name = "message"
        verbose_name_plural = "messages"
        ordering = ["-created_at"]
