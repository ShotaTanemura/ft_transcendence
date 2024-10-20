import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from logging import getLogger
import threading
import random
import time

logger = getLogger(__name__)

class ReactionConsumer(WebsocketConsumer):
    game_state = {}

    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'reaction_{self.room_name}'

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'player_joined',
                'message': 'Player joined',
            }
        )

    def player_joined(self, event):
        room_state = ReactionConsumer.game_state.get(self.room_group_name, {})
        players = room_state.get('players', set())
        players.add(self.channel_name)
        room_state['players'] = players
        ReactionConsumer.game_state[self.room_group_name] = room_state

        if len(players) == 2:
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'start_game',
                }
            )

    def start_game(self, event):
        self.send(text_data=json.dumps({
            'type': 'start_game',
        }))

        def change_color():
            delay = random.uniform(1, 5)
            time.sleep(delay)
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'change_color',
                }
            )

        threading.Thread(target=change_color).start()

    def change_color(self, event):
        self.send(text_data=json.dumps({
            'type': 'change_color',
        }))

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')

        if message_type == 'click':
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'button_clicked',
                    'channel_name': self.channel_name,
                }
            )

    def button_clicked(self, event):
        room_state = ReactionConsumer.game_state.get(self.room_group_name, {})
        if 'winner' not in room_state:
            room_state['winner'] = event['channel_name']
            ReactionConsumer.game_state[self.room_group_name] = room_state

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'announce_winner',
                    'winner_channel': event['channel_name'],
                }
            )
        else:
            pass

    def announce_winner(self, event):
        winner_channel = event['winner_channel']
        if self.channel_name == winner_channel:
            result = 'win'
        else:
            result = 'lose'

        self.send(text_data=json.dumps({
            'type': 'game_result',
            'result': result,
        }))

        self.close()

    def player_left(self, event):
        self.send(text_data=json.dumps({
            'type': 'player_left',
            'message': event['message'],
        }))

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

        room_state = ReactionConsumer.game_state.get(self.room_group_name, {})
        players = room_state.get('players', set())
        if self.channel_name in players:
            players.remove(self.channel_name)
            room_state['players'] = players
            ReactionConsumer.game_state[self.room_group_name] = room_state

        if len(players) < 2:
            if 'winner' in room_state:
                del room_state['winner']
            ReactionConsumer.game_state[self.room_group_name] = room_state

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'player_left',
                    'message': 'A player has left the game.',
                }
            )
            