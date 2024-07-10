import json
import random
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from threading import Lock
from enum import Enum, auto

class RoomState(Enum):
    Queuing = "queuing"
    Ready = "ready"
    Matching = "matching"
    Pending = "pending"
    In_Game = "in-game"
    Finished = "finished"

class ParticipantsState(Enum):
    Not_In_Place = "not-in-place"
    Ready = "ready"
    In_Game_1 = "in-game1"
    In_Game_2 = "in-game2"
    Observer = "observer"

class ParticipantResultState(Enum):
    Qualified = "qualified"
    Eliminated = "elimineted"

class RoomManager:
    room_instances = dict()
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
        self.channel_layer = get_channel_layer()
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
                await self.send_messege_to_group("send_room_information", {"sender": "room-manager", "type": "all-participants-connected"})
            await self.send_messege_to_group("send_room_information", {"sender": "room-manager", "type": "new-participants-connected", "contents": [participant.name for participant in self.participants]})
        return (True, "")

    # delete user from Room
    async def on_user_disconnected(self, user):
        with self.instance_lock:
            if self.room_state != RoomState.Queuing:
                return
            if user in self.participants:
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
    
    # score winner name 
    #def matching(self):
    #    random.shuffle(self.participants)
    #    new_round = []
    #    for index in range(0, len(self.participants), 2):
    #        new_round.push([{"player": self.participants[index], "score": -1, "qualified": True}, {"player": self.participants[index + 1], "score": -1, "qualified": True}])
    #    self.game_results.push(new_round)

    ## handle message from client
    ## select what to do considering both of room state and user state
    #async def on_receive_user_message(self, participant, message):
    #    with self.instance_lock:
    #        # TODO send error if sender is not participants
    #        # TODO confirm the syntax is good
    #        message_json = json.loads(message)
    #        # when Queuing
    #        if self.room_state == RoomState.Ready:
    #            await self.receive_user_message_in_ready(participant, message_json)
    #        # when Matching
    #        elif self.room_state == RoomState.Matching:
    #            await self.receive_user_message_in_matching(participant, message_json)
    #        # when Pending
    #        #elif self.room_state == RoomState.Pending:
    #        #   await receive_user_message_in_pending(participants, message_json)
    #        # when In_Game
    #        #elif receive_user_message_in_game(participants, message_json):
    #        # when Finished
    #        # receive_user_message_in_finished(participants, message_json):
    #        # else: do nothing

    ## change room_state to Matching, create tournament and send torunament result to client if all participants ready
    #async def receive_user_message_in_ready(self, participant, message_json):
    #    # TODO veridate message_json
    #    # TODO add this room to db
    #    self.participants_state[participant] = ParticipantsState.Ready
    #    if all(participant_state == ParticipantsState.Ready for participant_state in list(self.participants_state.values())):
    #        self.matching()
    #        self.room_state = RoomState.Matching
    #        self.send_messege_to_group("send_room_information", {"sender": "room_manager", "type": "current_trounament_state", "contents": self.game_results})

    ## change room_state to pending if all participants see the tournament
    ## send next game player wheather you're ready
    #async def receive_user_message_in_matching(self, participant, message_json):
    #    # TODO veridate message_json
    #    self.participants_state[participant] = ParticipantsState.Observer
    #    if all(participant_state == ParticipantsState.Observer for participant_state in list(self.participants_state.values())):
    #        self.set_next_game_infromation()
    #        self.send_messege_to_group("send_room_information", {"sender": "room_manager", "type": "participant_state", "contents": [{attendee.name : self.participants_state[attendee]} for attendee in self.participants]})
    
    ## change room_state to in-game if two player is ready
    ## change participants_state to obserber or in-game
    ## async def receive_user_message_in_pending(participants, message_json)
        