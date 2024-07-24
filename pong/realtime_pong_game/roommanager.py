import json
import asyncio
import random
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from threading import Lock
from enum import Enum, auto
from realtime_pong_game.ponggame import PongGame

import time

class RoomState(Enum):
    Queuing = "queuing"
    Ready = "ready"
    In_Game = "in-game"
    Finished = "finished"

class ParticipantsState(Enum):
    Not_In_Place = "not-in-place"
    Ready = "ready"
    In_Game_1 = "in-game1"
    In_Game_2 = "in-game2"
    Observer = "observer"

class RoomManager:
    room_instances = dict()
    lock = Lock()

    # get or create RoomManager instance
    @classmethod
    def get_instance(cls, room_name):
        with cls.lock:
            if room_name not in cls.room_instances:
                cls.room_instances[room_name] = cls(room_name)
            return cls.room_instances[room_name]

    # remove RoomManager instance
    @classmethod
    def remove_instance(cls, room_name):
        with cls.lock:
            cls.room_instances.pop(room_name)

    # TODO allow to set max_of_participants
    def __init__(self, room_name):
        self.instance_lock = Lock()
        self.channel_layer = get_channel_layer()
        self.pong_game = PongGame(room_name)
        self.room_name = room_name
        self.room_state = RoomState.Queuing
        self.participants = []
        self.participants_state = dict()
        self.max_of_participants = 2
        self.game_results = []

    # add user to Room
    async def on_user_connected(self, user):
        with self.instance_lock:
            if self.room_state != RoomState.Queuing:
                return (False, "exceed the limit of users")
            if user in self.participants:
                return (False, "user already exists in this room")
            self.participants.append(user)
            self.participants_state[user] = ParticipantsState.Not_In_Place
            if len(self.participants) == self.max_of_participants:
                self.room_state = RoomState.Ready
                await self.send_messege_to_group("send_room_information",\
                    {"sender": "room-manager",\
                    "type": "all-participants-connected",\
                    "contents": [participant.name for participant in self.participants]})
        return (True, "")

    # delete user from Room
    async def on_user_disconnected(self, user):
        with self.instance_lock:
            #TODO send message when RoomState is ready
            
            if self.room_state == RoomState.In_Game:
                return 
            self.participants.remove(user)
            if len(self.participants) == 0:
                self.__class__.remove_instance(self.room_name)
        return (True, "")

    # send message to Group that belogs to this room
    async def send_messege_to_group(self, method_type, content):
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": method_type,
                "contents": content,
            }
        )
    
    # event handler when receiving user message
    async def on_receive_user_message(self, participant, message):
        # TODO send error if sender is not participants
        # TODO confirm the message syntax is good
        message_json = json.loads(message)
        if self.room_state == RoomState.Ready:
            await self.user_became_ready_for_game(participant, message_json)
        elif self.room_state == RoomState.In_Game:
            await self.handle_game_action(participant, message_json)

    async def user_became_ready_for_game(self, participant, message_json):
        with self.instance_lock:
            #TODO validate the contents of message_json
            self.participants_state[participant] = ParticipantsState.Ready
            if all(ParticipantsState.Ready == self.participants_state[key] for key in self.participants_state):
                self.room_state = RoomState.In_Game
                #TODO change this allocation when implementing tournament
                await self.send_messege_to_group("send_room_information",\
                    {"sender": "room-manager", "type": "all-participants-ready"})
                self.participants_state[self.participants[0]] = ParticipantsState.In_Game_1
                self.participants_state[self.participants[1]] = ParticipantsState.In_Game_2
                asyncio.new_event_loop().run_in_executor(None, self.game_dispatcher,\
                    self.participants[0].name, self.participants[1].name)

    def game_dispatcher(self, player1_name, player2_name):
        self.pong_game.execute(player1_name=player1_name, player2_name=player2_name)
        #TODO update db to record match result
        self.room_state = RoomState.Finished
        async_to_sync(self.send_messege_to_group)("send_room_information",\
            {"sender": "room-manager", "type": "game-ended"})
        
    async def handle_game_action(self, participant, message_json):
        if self.participants_state[participant] == ParticipantsState.In_Game_1:
            await self.pong_game.recieve_player1_input(message_json)
        elif self.participants_state[participant] == ParticipantsState.In_Game_2:
            await self.pong_game.recieve_player2_input(message_json)