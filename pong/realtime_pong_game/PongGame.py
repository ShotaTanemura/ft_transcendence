import json
import asyncio
import random
import time
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from threading import Lock
from enum import Enum, auto

SCREEN_WIDTH = 1280
SCREEN_HEIGHT = 720
PADDLE_SIZE = 250

class Ball:

    def __init__(self, x_position, y_position):
        self.x_position = x_position
        self.y_position = y_position
        self.x_velocity = 10
        self.y_velocity = 5

    def move(self):
        self.x_position += self.x_velocity
        self.y_position += self.y_velocity

class Paddle:
    def __init__(self):
        self.position = SCREEN_HEIGHT / 2


class PongGame:

    def __init__(self, room_name):
        self.instance_lock = Lock()
        self.channel_layer = get_channel_layer()
        self.room_name = room_name
        self.ball = Ball(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2)
        self.player1_paddle = Paddle()
        self.player2_paddle = Paddle()
        self.player1_score = 0
        self.player2_score = 0
    
    def execute(self):
        while self.player1_score < 5 and self.player2_score < 5:
            print(f'player1: {self.player1_score} player2: {self.player2_score}')
            time.sleep(2)
            asyncio.run(self.run())
            self.ball = Ball(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2)
    
    async def run(self):
        running = True
        while(running):
            time.sleep(1/60)
            print(f'x: {self.ball.x_position}, y: {self.ball.y_position}')
            self.ball.move()
            is_scored, player_name  = self.handle_collision()
            if is_scored:
                self.evaluate_and_update_score(player_name)
                break
            await self.send_messege_to_group("send_game_information", {"sender": "PongGame", "type": "GameProperty", "contents" :{"ball": {"x_position": self.ball.x_position, "y_position": self.ball.y_position}, "player1_paddle": self.player1_paddle.position, "player2_paddle": self.player2_paddle.position}})

    def evaluate_and_update_score(self, player_name):
        if player_name == "player1":
            self.player1_score += 1
        elif player_name == "player2":
            self.player2_score += 1

    def handle_collision(self):
        if self.ball.x_position == 0:
            if self.ball.y_position < self.player1_paddle.position - PADDLE_SIZE / 2 or  self.player1_paddle.position + PADDLE_SIZE / 2 < self.ball.y_position:
                return (True, "player1")
            self.ball.x_velocity = -1 * self.ball.x_velocity
        elif self.ball.x_position == SCREEN_WIDTH:
            if self.ball.y_position < self.player2_paddle.position - PADDLE_SIZE / 2 or  self.player2_paddle.position + PADDLE_SIZE / 2 < self.ball.y_position:
                return (True, "player2")
            self.ball.x_velocity = -1 * self.ball.x_velocity
        if self.ball.y_position == SCREEN_HEIGHT or self.ball.y_position == 0:
            self.ball.y_velocity = -1 * self.ball.y_velocity
        return (False, "")

    #def game_closer(self)

    #def update_user_paddle_location(self)


    # recieve player message
    async def recieve_player1_input(self, message_json):
        if self.player1_paddle.position - PADDLE_SIZE / 2 < 0 or SCREEN_HEIGHT < self.player1_paddle.position + PADDLE_SIZE / 2:
            return 
        if message_json["contents"] == "up":
            self.player1_paddle.position += 5
        elif message_json["contents"] == "down":
            self.player1_paddle.position -= 5

    async def recieve_player2_input(self, message_json):
        if self.player2_paddle.position - PADDLE_SIZE / 2 < 0 or SCREEN_HEIGHT < self.player2_paddle.position + PADDLE_SIZE / 2:
            return
        if message_json["contents"] == "up":
            self.player2_paddle.position += 5
        elif message_json["contents"] == "down":
            self.player2_paddle.position -= 5
    
    # send message to Group that belogs to this room
    async def send_messege_to_group(self, method_type, content):
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": method_type,
                "contents": content,
            }
        )