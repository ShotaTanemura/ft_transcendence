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
        print(self.user)
        try:
            self.send_initial_messages()
        except Exception as e:
            logger.info(f"Error during initial message sending: {e}")
            self.close()

    def send_initial_messages(self):
        try:
            rooms = Rooms.objects.filter(userrooms__user_id_id=self.user.uuid)
            logger.info(f"Retrieved rooms: {rooms}")
            response_rooms = [serialize_rooms(room) for room in rooms]
            self.send(text_data=json.dumps({"rooms": response_rooms}))
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

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {"type": "room_message", "message": message}
        )

    def room_message(self, event):
        message = event["message"]

        self.send(text_data=json.dumps({"message": message}))
