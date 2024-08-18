import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from realtime_typing_game.roommanager import TypingRoomManager


class TypingPlayerConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # register group name
        self.room_name = "room_" + self.scope["url_route"]["kwargs"]["room_name"]
        # get Room instance
        self.room_manager = TypingRoomManager.get_instance(self.room_name)
        # verify user
        if self.scope["user"] == AnonymousUser():
            await self.close()
            return
        # register user
        self.user = self.scope["user"]
        # accept connection first
        await self.accept()
        # add user to group
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        # add user to Room
        is_success, error_message = await self.room_manager.on_user_connected(self.user)
        # TODO send error message before close
        if not is_success:
            await self.close()
            return

    async def receive(self, text_data=None, bytes_data=None):
        # deliver message to room manager
        # TODO This part occasionally throws an error indicating that the class member variable roommanager
        await self.room_manager.on_receive_user_message(self.user, text_data)

    async def disconnect(self, close_code):
        if hasattr(self, "room_manager"):
            await self.room_manager.on_user_disconnected(self.user)
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def send_room_information(self, event):
        await self.send(text_data=json.dumps(event["contents"]))

    async def send_game_information(self, event):
        await self.send(text_data=json.dumps(event["contents"]))
