from .typinggame import TypingGame  # 新たに追加
import json
import asyncio
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from threading import Lock
from enum import Enum, auto


class RoomState(Enum):
    Queuing = "queuing"
    Ready = "ready"
    In_Game = "in-game"
    Finished = "finished"


class ParticipantState(Enum):
    Not_In_Place = "not-in-place"
    Ready = "ready"


class TypingRoomManager:
    room_instances = dict()
    lock = Lock()

    @classmethod
    def get_instance(cls, room_name):
        with cls.lock:
            if room_name not in cls.room_instances:
                cls.room_instances[room_name] = cls(room_name)
            return cls.room_instances[room_name]

    @classmethod
    def remove_instance(cls, room_name):
        with cls.lock:
            cls.room_instances.pop(room_name)

    def __init__(self, room_name):
        self.instance_lock = Lock()
        self.channel_layer = get_channel_layer()
        self.typing_game = TypingGame(room_name)  # TypingGameを使用
        self.room_name = room_name
        self.room_state = RoomState.Queuing
        self.participants = []
        self.participants_state = dict()
        self.max_of_participants = 2

    async def on_user_connected(self, user):
        with self.instance_lock:
            if self.room_state != RoomState.Queuing:
                return (False, "exceed the limit of users")
            if user in self.participants:
                return (False, "user already exists in this room")
            self.participants.append(user)
            self.participants_state[user] = ParticipantState.Not_In_Place
            if len(self.participants) == self.max_of_participants:
                self.room_state = RoomState.Ready
                await self.send_messege_to_group(
                    "send_room_information",
                    {
                        "sender": "room-manager",
                        "type": "all-participants-connected",
                        "contents": [
                            participant.name for participant in self.participants
                        ],
                    },
                )
        return (True, "")

    async def on_user_disconnected(self, user):
        with self.instance_lock:
            self.participants.remove(user)
            if len(self.participants) == 0:
                self.__class__.remove_instance(self.room_name)
        return (True, "")

    async def send_messege_to_group(self, method_type, content):
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": method_type,
                "contents": content,
            },
        )

    async def on_receive_user_message(self, participant, message):
        message_json = json.loads(message)
        if self.room_state == RoomState.Ready:
            await self.user_became_ready_for_game(participant, message_json)
        elif self.room_state == RoomState.In_Game:
            await self.typing_game.handle_typing_input(message_json)  # TypingGameでの処理

    async def user_became_ready_for_game(self, participant, message_json):
        with self.instance_lock:
            self.participants_state[participant] = ParticipantState.Ready
            if all(
                ParticipantState.Ready == self.participants_state[key]
                for key in self.participants
            ):
                self.room_state = RoomState.In_Game
                await self.send_messege_to_group(
                    "send_room_information",
                    {"sender": "room-manager", "type": "all-participants-ready"},
                )

