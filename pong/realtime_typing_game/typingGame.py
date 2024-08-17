import json
import asyncio
import time
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from threading import Lock

# set them to the same values as frontend
FIELD_WIDTH = 1500
FIELD_HEIGHT = 585
FPS = 120


class PongGame:
    def __init__(self, room_name):
        self.channel_layer = get_channel_layer()
        self.room_name = room_name

    def execute(self, player1_name, player2_name):
        async_to_sync(self.send_messege_to_group)(
            "send_game_information",
            {
                "sender": "PongGame",
                "type": "game-ended",
                "contents": {
                    "player1": {"name": player1_name, "score": self.player1_score},
                    "player2": {"name": player2_name, "score": self.player2_score},
                },
            },
        )

    async def run(self):
            await self.send_messege_to_group(
                "send_game_information",
                {
                    "sender": "PongGame",
                    "type": "game-objects-moved",
                    "contents": {
                        "ball": {
                            "x_position": self.ball.x_position,
                            "y_position": self.ball.y_position,
                        },
                        "player1_paddle": self.player1_paddle.position,
                        "player2_paddle": self.player2_paddle.position,
                    },
                },
            )
    # recieve player message
    async def recieve_player1_input(self, message_json):
        print("player1から\"" + message_json["contents"]+ "\"を受け取りました")

    # send message to Group that belogs to this room
    async def send_messege_to_group(self, method_type, content):
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": method_type,
                "contents": content,
            },
        )
