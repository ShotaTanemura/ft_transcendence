import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from .models import Rooms, Messages
from django.contrib.auth.models import AnonymousUser
from logging import getLogger

logger = getLogger(__name__)


def serialize_rooms(room):
    return {"uuid": str(room.uuid), "name": room.name}


class RoomConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = "room_notifications"
        self.user = self.scope["user"]
        if self.user == AnonymousUser():
            logger.info("Anonymous user not allowed")
            self.close()
            return
        try:
            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name, self.channel_name
            )
            self.accept()
        except Exception as e:
            logger.error(f"Error during initial message sending: {str(e)}")
            self.close()
        try:
            self.send_initial_messages()
        except Exception as e:
            logger.info(f"Error during initial message sending: {e}")
            self.close()

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get("type")

        if message_type == "create_chatroom":
            chatroom_name = text_data_json.get("name")
            self.create_chatroom(chatroom_name)
        else:
            message = text_data_json["message"]
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name, {"type": "room_message", "message": message}
            )

    def create_chatroom(self, chatroom_name):
        try:
            room = Rooms.objects.create_room(chatroom_name, self.user)
            if not room:
                self.send(text_data=json.dumps({"error": "Failed to create chatroom"}))
            rooms = Rooms.objects.filter(userrooms__user_id_id=self.user.uuid)
            response_rooms = [serialize_rooms(room) for room in rooms]
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name, {"type": "room_created", "rooms": response_rooms}
            )
        except Exception as e:
            logger.error(f"Failed to create chatroom: {e}")
            self.send(text_data=json.dumps({"error": "Failed to create chatroom"}))

    def room_created(self, event):
        rooms = event["rooms"]
        self.send(text_data=json.dumps({"rooms": rooms}))

    def send_initial_messages(self):
        try:
            rooms = Rooms.objects.filter(userrooms__user_id_id=self.user.uuid)
            response_rooms = [serialize_rooms(room) for room in rooms]
            self.send(text_data=json.dumps({"rooms": response_rooms}))
        except Rooms.DoesNotExist:
            self.send(text_data=json.dumps({"rooms": []}))

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )
