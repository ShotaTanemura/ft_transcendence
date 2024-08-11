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



class Ball:
    def __init__(self, x_position, y_position):
        self.x_position = x_position
        self.y_position = y_position
        self.x_velocity = GRID / 3
        self.y_velocity = GRID / 3

    def move(self):
        self.x_position += self.x_velocity
        self.y_position += self.y_velocity


class Paddle:
    def __init__(self):
        self.instance_lock = Lock()
        self.position = FIELD_HEIGHT / 2
        self.size = PADDLE_SIZE
        self.velocity = 0

    def move(self):
        if (
            self.position - self.size / 2 + self.velocity < 0
            or FIELD_HEIGHT < self.position + self.size / 2 + self.velocity
        ):
            return
        self.position += self.velocity


class PongGame:
    def __init__(self, room_name):
        self.channel_layer = get_channel_layer()
        self.room_name = room_name
        self.ball = Ball(FIELD_WIDTH / 2, FIELD_HEIGHT / 2)
        self.player1_paddle = Paddle()
        self.player2_paddle = Paddle()
        self.player1_score = 0
        self.player2_score = 0

    def execute(self, player1_name, player2_name):
        while self.player1_score < 5 and self.player2_score < 5:
            async_to_sync(self.send_messege_to_group)(
                "send_game_information",
                {
                    "sender": "PongGame",
                    "type": "player-scored",
                    "contents": {
                        "player1": {"name": player1_name, "score": self.player1_score},
                        "player2": {"name": player2_name, "score": self.player2_score},
                    },
                },
            )
            time.sleep(2)
            self.ball = Ball(FIELD_WIDTH / 2, FIELD_HEIGHT / 2)
            async_to_sync(self.run)()
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
        running = True
        while running:
            time.sleep(1 / FPS)
            self.ball.move()
            self.player1_paddle.move()
            self.player2_paddle.move()
            is_scored, player_name = self.handle_collision()
            if is_scored:
                self.evaluate_and_update_score(player_name)
                break
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

    def evaluate_and_update_score(self, player_name):
        if player_name == "player1":
            self.player1_score += 1
        elif player_name == "player2":
            self.player2_score += 1

    def handle_collision(self):
        # change ball's velocity when hit some objects
        if (
            self.ball.x_position <= GRID
            and self.player1_paddle.position - PADDLE_SIZE / 2 <= self.ball.y_position
            and self.ball.y_position <= self.player1_paddle.position + PADDLE_SIZE / 2
        ):
            self.ball.x_velocity = -1 * self.ball.x_velocity
        elif (
            FIELD_WIDTH - GRID <= self.ball.x_position
            and self.player2_paddle.position - PADDLE_SIZE / 2 <= self.ball.y_position
            and self.ball.y_position <= self.player2_paddle.position + PADDLE_SIZE / 2
        ):
            self.ball.x_velocity = -1 * self.ball.x_velocity
        if FIELD_HEIGHT - GRID <= self.ball.y_position or self.ball.y_position < GRID:
            self.ball.y_velocity = -1 * self.ball.y_velocity
        # return true when ball is about to go outsize of field
        if self.ball.x_position < 0:
            return (True, "player2")
        elif FIELD_WIDTH < self.ball.x_position:
            return (True, "player1")
        return (False, "")

    # recieve player message
    async def recieve_player1_input(self, message_json):
        if message_json["contents"] == "keyup-go-up":
            self.player1_paddle.velocity = -1 * GRID / 2
        elif message_json["contents"] == "keyup-go-down":
            self.player1_paddle.velocity = GRID / 2
        elif message_json["contents"] == "keydown":
            self.player1_paddle.velocity = 0

    async def recieve_player2_input(self, message_json):
        if message_json["contents"] == "keyup-go-up":
            self.player2_paddle.velocity = -1 * GRID / 2
        elif message_json["contents"] == "keyup-go-down":
            self.player2_paddle.velocity = GRID / 2
        elif message_json["contents"] == "keydown":
            self.player2_paddle.velocity = 0

    # send message to Group that belogs to this room
    async def send_messege_to_group(self, method_type, content):
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": method_type,
                "contents": content,
            },
        )
