import json
import threading
import random
import time
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from logging import getLogger
from django.contrib.auth.models import User
from .models import GameRecord

logger = getLogger(__name__)


class ReactionConsumer(WebsocketConsumer):
    game_state = {}
    channel_to_user = {}

    def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"reaction_{self.room_name}"

        self.user = self.scope["user"]
        if self.user.is_authenticated:
            ReactionConsumer.channel_to_user[self.channel_name] = self.user
        else:
            self.close()
            return

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "player_joined",
                "channel_name": self.channel_name,
            },
        )

    def player_joined(self, event):
        room_state = ReactionConsumer.game_state.get(self.room_group_name, {})
        players = room_state.get("players", set())
        players.add(event["channel_name"])
        room_state["players"] = players
        ReactionConsumer.game_state[self.room_group_name] = room_state

        if len(players) == 2:
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    "type": "start_game",
                },
            )

    def start_game(self, event):
        room_state = ReactionConsumer.game_state.get(self.room_group_name, {})
        button_count = room_state.get("button_count", 1)

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "send_start_game",
                "button_count": button_count,
            },
        )

    def send_start_game(self, event):
        self.send(
            text_data=json.dumps(
                {
                    "type": "start_game",
                    "button_count": event["button_count"],
                }
            )
        )

        room_state = ReactionConsumer.game_state.get(self.room_group_name, {})
        if 'timer_started' not in room_state:
            threading.Thread(target=self.change_color_timer).start()
            room_state['timer_started'] = True
            ReactionConsumer.game_state[self.room_group_name] = room_state

    def change_color_timer(self):
        delay = random.uniform(1, 5)
        time.sleep(delay)
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "change_color",
            },
        )

    def change_color(self, event):
        room_state = ReactionConsumer.game_state.get(self.room_group_name, {})
        button_count = room_state.get("button_count", 1)
        random_button_index = random.randint(0, button_count - 1)
        room_state['correct_button_index'] = random_button_index
        ReactionConsumer.game_state[self.room_group_name] = room_state

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                "type": "send_change_color",
                "button_index": random_button_index,
            },
        )

    def send_change_color(self, event):
        button_index = event["button_index"]
        self.send(
            text_data=json.dumps(
                {
                    "type": "change_color",
                    "button_index": button_index,
                }
            )
        )

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get("type")

        if message_type == "set_button_count":
            button_count = text_data_json.get("button_count", 1)
            room_state = ReactionConsumer.game_state.get(self.room_group_name, {})
            room_state["button_count"] = button_count
            ReactionConsumer.game_state[self.room_group_name] = room_state
        elif message_type == "click":
            clicked_button_index = text_data_json.get("button_index")
            room_state = ReactionConsumer.game_state.get(self.room_group_name, {})
            correct_button_index = room_state.get("correct_button_index")
            if clicked_button_index == correct_button_index:
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        "type": "button_clicked",
                        "channel_name": self.channel_name,
                    },
                )
            else:
                # ボタンを間違えるのは許容する
                pass

    def button_clicked(self, event):
        room_state = ReactionConsumer.game_state.get(self.room_group_name, {})
        if "winner_channel" not in room_state:
            room_state["winner_channel"] = event["channel_name"]
            ReactionConsumer.game_state[self.room_group_name] = room_state

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    "type": "announce_winner",
                    "winner_channel": event["channel_name"],
                },
            )
        else:
            pass

    def announce_winner(self, event):
        winner_channel = event["winner_channel"]
        user = self.scope["user"]
        opponent_user = None

        room_state = ReactionConsumer.game_state.get(self.room_group_name, {})
        players = room_state.get("players", set())
        for channel_name in players:
            if channel_name != self.channel_name:
                opponent_user = ReactionConsumer.channel_to_user.get(channel_name)
                break

        if opponent_user is None:
            logger.warning("Opponent user not found.")
            return

        winner_user = ReactionConsumer.channel_to_user.get(winner_channel)

        if winner_user is None:
            logger.warning("Winner user not found.")
            return

        if user.is_authenticated:
            GameRecord.objects.create(
                user=user, opponent=opponent_user, winner=winner_user
            )
        else:
            logger.warning("Authenticated user not found; game result not saved.")

        result = "win" if self.channel_name == winner_channel else "lose"

        self.send(
            text_data=json.dumps(
                {
                    "type": "game_result",
                    "result": result,
                }
            )
        )

        self.close()

    def player_left(self, event):
        self.send(
            text_data=json.dumps(
                {
                    "type": "player_left",
                    "message": event["message"],
                }
            )
        )

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

        room_state = ReactionConsumer.game_state.get(self.room_group_name, {})
        players = room_state.get("players", set())
        if self.channel_name in players:
            players.remove(self.channel_name)
            room_state["players"] = players
            ReactionConsumer.game_state[self.room_group_name] = room_state

        if self.channel_name in ReactionConsumer.channel_to_user:
            del ReactionConsumer.channel_to_user[self.channel_name]

        if len(players) < 2:
            if "winner_channel" in room_state:
                del room_state["winner_channel"]
            ReactionConsumer.game_state[self.room_group_name] = room_state

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    "type": "player_left",
                    "message": "A player has left the game.",
                },
            )
            