import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from realtime_pong_game.RoomManager import RoomManager

class PlayerConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        # verify user
        if self.scope["user"] == AnonymousUser():
            await self.close()
            return
        # register user
        self.user = self.scope["user"]
        # register group name
        self.room_name = "room_" + self.scope["url_route"]["kwargs"]["room_name"]
        # get Room instance
        self.room_manager = RoomManager.get_instance(self.room_name)
        # accept connection first
        await self.accept()
        # add user to group
        await self.channel_layer.group_add(
            self.room_name, self.channel_name
        )
        # add user to Room
        is_success, error_message = await self.room_manager.on_user_connected(self.user)
        # TODO send error message before close
        if not is_success:
            await self.close()
            return

    async def receive(self, text_data=None, bytes_data=None):
        await self.room_manager.on_receive_user_message(self.user, text_data)

    async def disconnect(self, close_code):
        await self.room_manager.on_user_disconnected(self.user)
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def send_room_information(self, event):
        await self.send(text_data=json.dumps(event["contents"]))
        if event["contents"]["type"] == "GameEnd":
            self.close()

    async def send_individual_information(self, event):
        if event["contents"]["participant"] == str(self.user.uuid):
            await self.send(text_data=json.dumps(event["contents"]["contents"]))

    async def send_game_information(self, event):
        await self.send(text_data=json.dumps(event["contents"])) 