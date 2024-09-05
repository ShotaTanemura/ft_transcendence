import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from realtime_pong_game.roommanager import RoomManager


class PlayerConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # accept connection first
        await self.accept()

        # register user
        self.user = self.scope["user"]
        # verify user
        if self.scope["user"] == AnonymousUser():
            await self.send(
                text_data=json.dumps(
                    {
                        "sender": "room-manager",
                        "type": "error-message",
                        "contents": "User not Found.",
                    }
                )
            )
            await self.close()
            return

        # register group name
        self.room_name = self.scope["url_route"]["kwargs"].get("room_name")
        self.user_role = self.scope["url_route"]["kwargs"].get("user_role")
        self.user_nickname = self.scope["url_route"]["kwargs"].get("user_nickname")
        # if url path is not valid, close connection
        if self.room_name == None or self.user_role == None:
            await self.send(
                text_data=json.dumps(
                    {
                        "sender": "room-manager",
                        "type": "error-message",
                        "contents": "room name or user role is invalid.",
                    }
                )
            )
            await self.close()
            return

        # if user want to host, confirm that room is empty. if not, connection closed.
        if self.user_role == "host":
            self.room_manager = RoomManager.host_room(self.room_name)
            if self.room_manager == None:
                await self.send(
                    text_data=json.dumps(
                        {
                            "sender": "room-manager",
                            "type": "error-message",
                            "contents": "This room is ongoing.",
                        }
                    )
                )
                await self.close()
                return
        # if user want to guest, confirm that room can be entered. if not, connection closed.
        elif self.user_role == "guest":
            self.room_manager = RoomManager.guest_room(self.room_name)
            if self.room_manager == None:
                await self.send(
                    text_data=json.dumps(
                        {
                            "sender": "room-manager",
                            "type": "error-message",
                            "contents": "Room not Found.",
                        }
                    )
                )
                await self.close()
                return
        # if user_role is neither host nor guest, connection closed.
        else:
            await self.send(
                text_data=json.dumps(
                    {
                        "sender": "room-manager",
                        "type": "error-message",
                        "contents": "user role is invalid.",
                    }
                )
            )
            await self.close()
            return

        # add user to group
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        # add user to Room
        is_success = await self.room_manager.on_user_connected(
            self.user, self.user_nickname
        )
        if not is_success:
            await self.send(
                text_data=json.dumps(
                    {
                        "sender": "room-manager",
                        "type": "error-message",
                        "contents": "cannot connect room.",
                    }
                )
            )
            await self.close()
            return

    async def receive(self, text_data=None, bytes_data=None):
        # deliver message to room manager
        message_json = json.loads(text_data)
        if not message_json.keys() >= {"sender", "type"}:
            await self.send(
                text_data=json.dumps(
                    {
                        "sender": "room-manager",
                        "type": "error-message",
                        "contents": "message format is invalid.",
                    }
                )
            )
            return
        if message_json["type"] == "get-room-state":
            await self.send(
                text_data=json.dumps(
                    {
                        "sender": "consumer",
                        "type": "room-state",
                        "contents": self.room_manager.room_state.value,
                    }
                )
            )
            return
        await self.room_manager.on_receive_user_message(self.user, message_json)

    async def disconnect(self, close_code):
        if self.room_manager != None:
            await self.room_manager.on_user_disconnected(self.user)
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def send_room_information(self, event):
        await self.send(text_data=json.dumps(event["contents"]))

    async def send_game_information(self, event):
        await self.send(text_data=json.dumps(event["contents"]))

    async def notify_client_proccessing_complete(self, event):
        await self.close()
