from django.db import models
import uuid
from pong.models.user import User
from django.db.utils import IntegrityError
from logging import getLogger
from django.db.models import Q

logger = getLogger(__name__)


class RoomsManager(models.Manager):
    def create_room(self, name, user, room_type="group"):
        if not name:
            raise ValueError("nameを入力してください")
        try:
            room = self.model(name=name)
            room.room_type = room_type
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

    def join_room(self, user, room, status):
        room = self.model.objects.get(uuid=room)
        if not room:
            raise ValueError("部屋が見つかりません")

        user_room = UserRooms.objects.create_user_room(user, room, status)
        user_room.save(using=self._db)

        return room

    def get_rooms(self):
        rooms = self.model.objects.all().filter(user_room_status="active")
        return rooms

    def get_rooms_by_user_status(self, user, status=[]):
        if status != []:
            user_rooms_status = status
        else:
            user_rooms_status = [
                UserRooms.UserRoomStatus.ACTIVE,
                UserRooms.UserRoomStatus.READY,
            ]
        rooms = self.model.objects.filter(
            userrooms__user_id=user, userrooms__user_room_status__in=user_rooms_status
        )
        return rooms

    def get_rooms_non_participation(self, user):
        rooms = self.model.objects.exclude(userrooms__user_id=user).filter(
            room_type=Rooms.RoomType.GROUP
        )
        return rooms

    def get_users_in_room(self, room_id):
        try:
            room = self.model.objects.get(uuid=room_id)
            users = User.objects.filter(
                userrooms__room_id=room, userrooms__user_room_status="active"
            )
            return users
        except self.model.DoesNotExist:
            raise ValueError("指定された部屋が存在しません")

    def leave_room(self, user, room_uuid):
        room = self.model.objects.get(uuid=room_uuid)
        if not room:
            raise ValueError("部屋が見つかりません")

        user_room = UserRooms.objects.get(user_id=user, room_id=room)
        logger.info(f"User room before deletion: {user_room}")

        user_room.delete()

        try:
            UserRooms.objects.get(user_id=user, room_id=room)
            logger.warning("User room was not deleted.")
        except UserRooms.DoesNotExist:
            logger.info("User room was successfully deleted.")

        users = UserRooms.objects.get_users(room)
        if not users:
            logger.info(f"No users left in the room, deleting room: {room}")
            room.delete()
        else:
            logger.info(f"Users still exist in the room: {room}")

        return room


class Rooms(models.Model):
    class RoomType(models.TextChoices):
        DM = "dm", "Direct Message"
        GROUP = "group", "Group"

    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(unique=True, blank=False, max_length=20)
    room_type = models.CharField(
        max_length=5,
        choices=RoomType.choices,
        default=RoomType.GROUP,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = RoomsManager()

    def __str__(self):
        return f"{self.name} ({self.get_room_type_display()})"

    class Meta:
        db_table = "rooms"
        verbose_name = "room"
        verbose_name_plural = "rooms"
        ordering = ["-created_at"]


class UserRoomsManager(models.Manager):
    def create_user_room(self, user, room, status):
        user_room = self.model(user_id=user, room_id=room, user_room_status=status)
        user_room.save(using=self._db)
        return user_room

    def update_status(self, user, room, status):
        user_room = self.model.objects.get(user_id=user, room_id=room)
        user_room.user_room_status = status
        user_room.save(using=self._db)
        return user_room

    def get_users(self, room_id):
        users = self.model.objects.filter(room_id=room_id)
        return users

    def get_user_room(self, user, room):
        user_room = self.model.objects.get(user_id=user, room_id=room)
        return user_room


class UserRooms(models.Model):
    class UserRoomStatus(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        INVITED = "invited", "Invited"
        READY = "ready", "Ready"

    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    room_id = models.ForeignKey(Rooms, on_delete=models.CASCADE)
    user_room_status = models.CharField(
        max_length=8,
        choices=UserRoomStatus.choices,
        default=UserRoomStatus.ACTIVE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserRoomsManager()

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


class UserBlockManager(models.Manager):
    def block_user(self, blocker, blocked):
        user_block = self.model(blocker_id=blocker, blocked_id=blocked)
        user_block.save(using=self._db)
        return user_block

    def unblock_user(self, blocker, blocked):
        user_block = self.model.objects.get(blocker_id=blocker, blocked_id=blocked)
        user_block.delete()
        return user_block

    def get_blocked_users(self, blocker):
        blocked_users = self.model.objects.filter(blocker_id=blocker)
        return blocked_users

    def get_blockers(self, blocked):
        blockers = self.model.objects.filter(blocked_id=blocked)
        return blockers

    def is_blocked(self, blocker, blocked):
        try:
            user_block = self.model.objects.get(blocker_id=blocker, blocked_id=blocked)
            return True
        except self.model.DoesNotExist:
            return False


class UserBlock(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    blocker_id = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="blocker"
    )
    blocked_id = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="blocked"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserBlockManager()

    class Meta:
        db_table = "user_blocks"
        verbose_name = "user_block"
        verbose_name_plural = "user_blocks"
        ordering = ["created_at"]
