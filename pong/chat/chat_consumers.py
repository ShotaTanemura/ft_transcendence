# chat/consumers.py
import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from .models import Rooms, Messages, UserBlock, User
from logging import getLogger

logger = getLogger(__name__)


def serialize_user(user):
    return {"uuid": str(user.uuid), "name": user.name}


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "chat_%s" % self.room_name

        logger.info(f"Attempting to connect to room: {self.room_name}")

        self.user = self.scope["user"]
        if self.user == AnonymousUser():
            logger.info("Anonymous user not allowed")
            self.close()
            return
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()

        room = Rooms.objects.get(uuid=self.room_name)
        room_id = room.uuid
        users = Rooms.objects.get_users_in_room(room_id)

        users = [serialize_user(user) for user in users]
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "init",
                "users": users,
            },
        )

        try:
            self.send_initial_messages()
        except Exception as e:
            logger.info(f"Error during initial message sending: {e}")
            self.close()

    def send_initial_messages(self):
        try:
            room = Rooms.objects.get(uuid=self.room_name)
            room_id = room.uuid
            logger.info(f"Room ID: {room_id}")

            messages = Messages.manager.get_messages(room_id)
            logger.info(f"Retrieved messages: {len(messages)}")
            users = Rooms.objects.get_users_in_room(room_id)

            users = [serialize_user(user) for user in users]

            logger.info(f"Users in room: {users}")
            if not messages:
                logger.info(f"No messages found")
                self.send(
                    text_data=json.dumps(
                        {
                            "users": users,
                        }
                    )
                )
                return

            for message in messages:
                logger.info(f"Sending message: {message.message}")
                self.send(
                    text_data=json.dumps(
                        {
                            "user": message.user_id.name,
                            "message": message.message,
                            "users": users,
                            "created_at": message.created_at.isoformat(),
                        }
                    )
                )
        except Rooms.DoesNotExist:
            logger.info("Room does not exist")
            self.close()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        job_type = text_data_json["job_type"]
        logger.info(f"Received job type: {job_type}")
        if job_type == "send_message":
            message = text_data_json["message"]
            room = Rooms.objects.get(uuid=self.room_name)
            user = self.user
            if room.room_type == "dm":
                other = Rooms.objects.get_users_in_room(room.uuid).exclude(
                    uuid=user.uuid
                )[0]
                is_blocked = UserBlock.objects.is_blocked(user, other)
                if is_blocked:
                    logger.info(f"User is blocked")
                    return

            saved_message = Messages.manager.create_message(user, room, message)

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "user": saved_message.user_id.name,
                    "message": saved_message.message,
                    "created_at": saved_message.created_at.isoformat(),
                },
            )
        elif job_type == "block_user":
            block_user_uuid = text_data_json["user_uuid"]
            blocked = User.objects.get(uuid=block_user_uuid)
            logger.info(f"Block user: {block_user_uuid}")
            block_user = UserBlock.objects.block_user(self.user, blocked)
            logger.info(f"Blocked user: {block_user}")
        elif job_type == "leave_room":
            room_id = text_data_json.get("room_uuid")
            Rooms.objects.leave_room(self.user, room_id)
            users = Rooms.objects.get_users_in_room(room_id)

            users = [serialize_user(user) for user in users]
            logger.info(f"Users in room: {users}")
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    "type": "leave_room",
                    "users": users,
                },
            )

    def chat_message(self, event):
        self.send(
            text_data=json.dumps(
                {
                    "user": event["user"],
                    "message": event["message"],
                    "created_at": event["created_at"],
                }
            )
        )
    
    def leave_room(self, event):
        logger.info(f"Event: {event}")
        self.send(
            text_data=json.dumps(
                {
                    "users": event["users"],
                }
            )
        )
    
    def init(self, event):
        logger.info(f"Event: {event}")
        self.send(
            text_data=json.dumps(
                {
                    "users": event["users"],
                }
            )
        )
