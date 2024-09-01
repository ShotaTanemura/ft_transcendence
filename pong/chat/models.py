from django.db import models
import uuid
from pong.models import User
from django.db.utils import IntegrityError
from logging import getLogger

logger = getLogger(__name__)


class RoomsManager(models.Manager):
    def create_room(self, name, user):
        if not name:
            raise ValueError("nameを入力してください")
        try:
            room = self.model(name=name)
            room.save(using=self._db)

            user_room = UserRooms(user_id=user, room_id=room)
            user_room.save(using=self._db)

            return room
        except IntegrityError as e:
            logger.error(e)
            if "duplicate key value violates unique constraint" in str(e):
                raise ValueError("同じ名前の部屋が既に存在します")
            else:
                raise e

    def join_room(self, user, room):
        room = self.model.objects.get(uuid=room)
        if not room:
            raise ValueError("部屋が見つかりません")

        user_room = UserRooms(user_id=user, room_id=room)
        user_room.save(using=self._db)

        return room

    def get_rooms(self):
        rooms = self.model.objects.all()
        return rooms


class Rooms(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(unique=True, blank=False, max_length=20)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = RoomsManager()

    def __str__(self):
        return self.name

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

    objects = models.Manager()

    class MessagesManager(models.Manager):
        def create_message(self, user_id, room_id, message):
            message = self.model(user_id=user_id, room_id=room_id, message=message)
            message.save(using=self._db)
            return message

        def get_messages(self, room_id):
            messages = self.model.objects.filter(room_id=room_id).select_related(
                "user_id"
            )
            return messages

    manager = MessagesManager()

    class Meta:
        db_table = "messages"
        verbose_name = "message"
        verbose_name_plural = "messages"
        ordering = ["created_at"]
