import json, jwt, django
from channels.db import database_sync_to_async
from django.conf import settings
from pong.models import User
from channels.generic.websocket import AsyncWebsocketConsumer
from pong.middleware.auth import get_uuid_by_token
from django.utils import timezone
from realtime.models import Room, UserRoomMapping

class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "chat_%s" % self.room_name

        uuid = get_uuid_by_token(self.scope["cookies"]["token"])
        if uuid == None:
            self.close()
        else:
            if await database_sync_to_async(Room.objects.get_active_room_by_name)(room_name=self.room_name) == None:
                await database_sync_to_async(Room.objects.add_room)(room_name=self.room_name, host_uuid=uuid)
            await database_sync_to_async(UserRoomMapping.objects.join_room)(room_name=self.room_name, user_uuid=uuid)
            print(await database_sync_to_async(UserRoomMapping.objects.get_user_names_of_room)(room_name=self.room_name))
            await self.channel_layer.group_add(
                self.room_group_name, self.channel_name
            )
            await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        if text_data_json["type"] == "socket-connected":
            displayName = text_data_json["displayName"]

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "connected_message", "displayName": displayName}
            )
        elif text_data_json["type"] == "socket-disconnected":
            displayName = text_data_json["displayName"]
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "disconnected_message", "displayName": displayName}
            )
        elif text_data_json["type"] == "message":
            message = text_data_json["message"]
            displayName = text_data_json["displayName"]
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "chat_message", "message": message, "displayName": displayName}
            )

    # Receive message from room group
    async def chat_message(self, event):
        message = event["message"]
        displayName = event["displayName"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"type": "chat_message", "message": message, "displayName": displayName}))

    # Connect message from room group
    async def connected_message(self, event):
        displayName = event["displayName"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"type": "user_connected", "displayName": displayName}))

  # Connect message from room group
    async def disconnected_message(self, event):
        displayName = event["displayName"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"type": "user_disconnected", "displayName": displayName}))