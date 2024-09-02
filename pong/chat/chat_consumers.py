# chat/consumers.py
import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from .models import Rooms, Messages
from logging import getLogger

logger = getLogger(__name__)


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

            for message in messages:
                self.send(
                    text_data=json.dumps(
                        {
                            "user": message.user_id.name,
                            "message": message.message,
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
        message = text_data_json["message"]
        room = Rooms.objects.get(uuid=self.room_name)
        user = self.user

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
