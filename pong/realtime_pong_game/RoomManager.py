import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from threading import Lock
from enum import Enum, auto

class RoomState(Enum):
    Queueing = auto()
    Ready = auto()
    Matching = auto()
    Pending = auto()
    In_Game = auto()
    Finished = auto()

class ParticipantsState(Enum):
    Not_In_Place = auto()
    Ready = auto()
    In_Game_1 = auto()
    In_Game_2 = auto()
    Qualified = auto()
    Eliminated = auto()
    

class RoomManager:
    room_instances = {}
    lock = Lock()

    # create RoomModel
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

    # TODO allow to set max_of_participants
    def __init__(self, room_name):
        self.instance_lock = Lock()
        self.room_state = RoomState.Queueing
        self.room_name = room_name
        self.channel_layer = get_channel_layer()
        self.participants = []
        self.participants_state = dict()
        self.max_of_participants = 2

    # add user to Room
    async def on_user_connected(self, user):
        with self.instance_lock:
            if self.room_state != RoomState.Queueing:
                return (False, "exceed the limit of users")
            if user in self.participants:
                return (False, "user already exists in this room")
            self.participants.append(user)
            self.participants_state[user] = ParticipantsState.Not_In_Place
            if len(self.participants) == self.max_of_participants:
                self.room_state = RoomState.Ready
            await self.send_messege_to_group("send_room_information", {"type": "room-information", "contents": "add-user", "user": user.name})
        return (True, "")

    # delete user from Room
    async def on_user_disconnected(self, user):
        with self.instance_lock:
            if user in self.participants:
                self.participants.remove(user)
            if len(self.participants) == 0:
                self.__class__.remove_instance(self.room_name)
        return (True, "")
    
    # handle message from client
    # select what to do considering both of room state and user state
    async def on_receive_user_message(self, user, message):
        print(message)
    
    # send message to Group that belogs to this room
    async def send_messege_to_group(self, method_type, content):
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": method_type,
                "contents": json.dumps(content),
            }
        )