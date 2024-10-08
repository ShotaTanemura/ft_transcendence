import json
import asyncio
import random
from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync
from threading import Lock
from enum import Enum, auto
from realtime_pong_game.ponggame import PongGame
from realtime_pong_game.tournamentmanager import TournamentManager
from realtime_pong_game.models import TournamentInfo, MatchInfo
import time


class RoomState(Enum):
    Not_All_Participants_Connected = "Not_All_Participants_Connected"
    Display_Tournament = "Display_Tournament"
    In_Game = "In_Game"
    Finished = "Finished"


class ParticipantState(Enum):
    Not_In_Place = "not-in-place"
    Ready = "ready"
    Player1 = "player1"
    Player2 = "player2"
    Observer = "observer"


class RoomManager:
    room_instances = dict()
    lock = Lock()

    @classmethod
    def host_room(cls, room_name):
        with cls.lock:
            if room_name not in cls.room_instances:
                cls.room_instances[room_name] = Room(room_name)
                return cls.room_instances[room_name]
            return None

    @classmethod
    def guest_room(cls, room_name):
        with cls.lock:
            # TODO validate precisely weather room can be entered
            if room_name in cls.room_instances:
                return cls.room_instances[room_name]
            return None

    # get or create RoomManager instance
    @classmethod
    def get_instance(cls, room_name):
        with cls.lock:
            if room_name not in cls.room_instances:
                cls.room_instances[room_name] = Room(room_name)
            return cls.room_instances[room_name]

    # remove RoomManager instance
    @classmethod
    def remove_instance(cls, room_name):
        with cls.lock:
            cls.room_instances.pop(room_name)


class Room:
    # TODO allow to set max_of_participants
    def __init__(self, room_name):
        self.instance_lock = Lock()
        self.channel_layer = get_channel_layer()
        self.pong_game = PongGame(room_name)
        self.room_name = room_name
        self.room_state = RoomState.Not_All_Participants_Connected
        self.participants = []
        self.participant_nickname_dict = dict()
        self.participants_state = dict()
        self.max_of_participants = 2
        self.game_results = []

    def set_room_state(self, new_room_state):
        with self.instance_lock:
            self.room_state = new_room_state
            return True

    def set_participant_state(self, participant, new_participant_state):
        with self.instance_lock:
            self.participants_state[participant] = new_participant_state
            return True

    def add_new_participant(self, new_participant, new_participant_nickname):
        with self.instance_lock:
            if self.room_state != RoomState.Not_All_Participants_Connected:
                return False
            if new_participant in self.participants:
                return False
            self.participants.append(new_participant)
            self.participant_nickname_dict[new_participant] = (
                f"{new_participant_nickname} #{len(self.participants)}"
            )
        self.set_participant_state(new_participant, ParticipantState.Not_In_Place)
        return True

    def remove_participant(self, participant):
        if (
            self.room_state != RoomState.Not_All_Participants_Connected
            and self.room_state != RoomState.Finished
        ):
            return False
        with self.instance_lock:
            if participant in self.participants:
                self.participants.remove(participant)
                self.participants_state.pop(participant)
                return True
            return False

    # add user to Room
    async def on_user_connected(self, user, user_nickname):
        if not self.add_new_participant(user, user_nickname):
            return False
        if len(self.participants) == self.max_of_participants:
            self.set_room_state(RoomState.Display_Tournament)
            await self.send_room_state_to_group()
            asyncio.new_event_loop().run_in_executor(
                None,
                self.game_dispatcher,
                "",
            )
        return True

    # delete user from Room
    async def on_user_disconnected(self, participant):
        self.remove_participant(participant)
        if len(self.participants) == 0:
            RoomManager.remove_instance(self.room_name)
        return True

    # send message to Group that belogs to this room
    async def send_messege_to_group(self, method_type, content=None):
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": method_type,
                "contents": content,
            },
        )

    # make consumer to send room state to group via send_room_information
    async def send_room_state_to_group(self):
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": "send_room_information",
                "contents": {
                    "sender": "room-manager",
                    "type": "room-state",
                    "contents": self.room_state.value,
                },
            },
        )

    # event handler when receiving user message
    async def on_receive_user_message(self, participant, message_json):
        if self.room_state == RoomState.In_Game:
            await self.handle_game_action(participant, message_json)

    def change_participants_state_for_game(self, player1, player2):
        for participant in self.participants_state.keys():
            if participant == player1:
                self.set_participant_state(participant, ParticipantState.Player1)
            elif participant == player2:
                self.set_participant_state(participant, ParticipantState.Player2)
            else:
                self.set_participant_state(participant, ParticipantState.Observer)

    # TODO Make sure it functions correctly even without dummy data
    def game_dispatcher(self, dummy_data):
        # set parameter for tournament
        is_tournament_ongoing = True
        tournament_winner = None
        self.tournament_manager = TournamentManager(
            self.participants, self.participant_nickname_dict
        )
        # add TournamentInfo to DB
        tournament_info = TournamentInfo(tournament_name=self.room_name)
        tournament_info.save()

        while is_tournament_ongoing:
            (player1, player2) = self.tournament_manager.get_next_match_players()
            # if player2 is None, player1 is the tournament winner
            if player2 == None:
                tournament_winner = player1
                async_to_sync(self.send_messege_to_group)(
                    "send_room_information",
                    {
                        "sender": "room_manager",
                        "type": "tournament-winner",
                        "contents": self.participant_nickname_dict[tournament_winner],
                    },
                )
                break
            # get change next game player's state
            self.change_participants_state_for_game(player1, player2)
            # get tournament list
            tournament = (
                self.tournament_manager.get_current_tournament_information_as_list()
            )
            # send tournament list to client
            async_to_sync(self.send_messege_to_group)(
                "send_room_information",
                {
                    "sender": "room_manager",
                    "type": "tournament",
                    "contents": tournament,
                },
            )
            # change room state to Display_Tournament
            self.set_room_state(RoomState.Display_Tournament)
            async_to_sync(self.send_room_state_to_group)()
            time.sleep(3)
            # change room state to In_Game
            self.set_room_state(RoomState.In_Game)
            async_to_sync(self.send_room_state_to_group)()
            # execute game
            (player1_score, player2_score) = self.pong_game.execute(
                player1_name=self.participant_nickname_dict[player1],
                player2_name=self.participant_nickname_dict[player2],
            )
            # update match db from exected game
            MatchInfo.objects.create(
                tournament_info=tournament_info,
                player1=player1,
                player2=player2,
                player1_score=player1_score,
                player2_score=player2_score,
            )
            # update trounament from executed game
            self.tournament_manager.update_current_match(player1_score, player2_score)
        # save the tournament winner to TournamentInfo
        tournament_info.winner = tournament_winner
        tournament_info.save()
        # send room status to client
        self.set_room_state(RoomState.Finished)
        async_to_sync(self.send_room_state_to_group)()
        async_to_sync(self.send_messege_to_group)("notify_client_proccessing_complete")
        RoomManager.remove_instance(self.room_name)

    async def handle_game_action(self, participant, message_json):
        if self.participants_state[participant] == ParticipantState.Player1:
            await self.pong_game.recieve_player1_input(message_json)
        elif self.participants_state[participant] == ParticipantState.Player2:
            await self.pong_game.recieve_player2_input(message_json)
