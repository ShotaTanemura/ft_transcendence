import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from .models import Rooms, Messages, User, UserRooms, UserBlock
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
        logger.info(f"Received data: {text_data_json}")
        job_type = text_data_json.get("job_type")

        if job_type == "create_chatroom":
            message_type = text_data_json.get("room_type")
            if message_type == "dm":
                chatroom_name = text_data_json.get("name")
                room_type = text_data_json.get("room_type", "dm")
                invited_user_email = text_data_json.get("email", None)
                if invited_user_email is None:
                    self.send(text_data=json.dumps({"error": "No email provided"}))
                self.create_chatroom(chatroom_name, room_type, invited_user_email)
            elif message_type == "group":
                chatroom_name = text_data_json.get("name")
                room_type = text_data_json.get("room_type", "group")
                self.create_chatroom(chatroom_name, room_type)

        elif job_type == "invited_room":
            room_id = text_data_json.get("room_uuid")
            status = text_data_json.get("status")
            UserRooms.objects.update_status(self.user, room_id, status)
            self.send_initial_messages()
        elif job_type == "join_chatroom":
            room_id = text_data_json.get("room_uuid")
            Rooms.objects.join_room(self.user, room_id, UserRooms.UserRoomStatus.READY)
            self.send_initial_messages()
        elif job_type == "refresh_rooms":
            self.send_initial_messages()

    def create_chatroom(self, chatroom_name, room_type, invited_user_email=None):
        try:
            logger.info(f"my user: {self.user}")
            room = Rooms.objects.create_room(chatroom_name, self.user, room_type)
            logger.info(f"Room created: {room}")
            if not room:
                self.send(text_data=json.dumps({"error": "Failed to create chatroom"}))
            logger.info(f"inivted_user_email: {invited_user_email}")
            if invited_user_email is not None:
                invited_user = User.objects.get_user_email(invited_user_email)
                if not invited_user:
                    self.send(
                        text_data=json.dumps(
                            {"error": "招待するユーザーが見つかりません"}
                        )
                    )
                if invited_user == self.user:
                    self.send(
                        text_data=json.dumps(
                            {"error": "自分自身を招待することはできません"}
                        )
                    )
                    return
                is_blocked = UserBlock.objects.is_blocked(self.user, invited_user)
                if is_blocked:
                    self.send(
                        text_data=json.dumps(
                            {"error": "招待するユーザーがブロックされています"}
                        )
                    )
                    return
                UserRooms.objects.create_user_room(invited_user, room, "invited")
            logger.info(f"Room created: {room}")
            self.refresh_rooms()
        except Exception as e:
            logger.error(f"Failed to create chatroom: {e}")
            self.send(text_data=json.dumps({"error": "Failed to create chatroom"}))

    def room_created(self, event):
        rooms = event["rooms"]
        self.send(text_data=json.dumps({"rooms": rooms}))

    def refresh_rooms(self):
        rooms = Rooms.objects.get_rooms_by_user_status(self.user)
        invited_rooms = Rooms.objects.get_rooms_by_user_status(
            self.user, [UserRooms.UserRoomStatus.INVITED]
        )
        non_participation = Rooms.objects.get_rooms_non_participation(self.user)

        response_rooms = [serialize_rooms(room) for room in rooms]
        response_invited_rooms = [serialize_rooms(room) for room in invited_rooms]
        response_non_participation = [
            serialize_rooms(room) for room in non_participation
        ]

        logger.info("refresh_rooms: send")

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "init",
                "rooms": response_rooms,
                "invited_rooms": response_invited_rooms,
                "non_participation": response_non_participation,
            },
        )

    def send_initial_messages(self):
        try:
            rooms = Rooms.objects.get_rooms_by_user_status(self.user)
            invited_rooms = Rooms.objects.get_rooms_by_user_status(
                self.user, [UserRooms.UserRoomStatus.INVITED]
            )
            non_participation = Rooms.objects.get_rooms_non_participation(self.user)

            response_rooms = [serialize_rooms(room) for room in rooms]
            response_invited_rooms = [serialize_rooms(room) for room in invited_rooms]
            response_non_participation = [
                serialize_rooms(room) for room in non_participation
            ]
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    "type": "init",
                    "rooms": response_rooms,
                    "invited_rooms": response_invited_rooms,
                    "non_participation": response_non_participation,
                },
            )

        except Rooms.DoesNotExist:
            self.send(text_data=json.dumps({"rooms": []}))

    def init(self, event):
        logger.info(f"Event: {event}")
        rooms = Rooms.objects.get_rooms_by_user_status(self.user)
        invited_rooms = Rooms.objects.get_rooms_by_user_status(
            self.user, [UserRooms.UserRoomStatus.INVITED]
        )
        non_participation = Rooms.objects.get_rooms_non_participation(self.user)

        response_rooms = [serialize_rooms(room) for room in rooms]
        response_invited_rooms = [serialize_rooms(room) for room in invited_rooms]
        response_non_participation = [
            serialize_rooms(room) for room in non_participation
        ]
        self.send(
            text_data=json.dumps(
                {
                    "rooms": response_rooms,
                    "invited_rooms": response_invited_rooms,
                    "non_participation": response_non_participation,
                }
            )
        )

    def game_notification(self, event):
        users = event["users"]
        roomId = event["room_id"]


        uus = []
        for user in users:
            u = User.objects.get_user_nickname(user)
            uus.append(u)
        for u in uus:
            if u == self.user:
                self.send(
                    text_data=json.dumps(
                        {
                            "notification": {
                                "url": f"/pong-game-home?room-id={roomId}&name=guest&number-of-players=4",
                            }
                        }
                    )
                )


    def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            async_to_sync(self.channel_layer.group_discard)(
                self.room_group_name, self.channel_name
            )
