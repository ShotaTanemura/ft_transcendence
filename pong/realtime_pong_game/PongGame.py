import json
import asyncio
import random
import time
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from threading import Lock
from enum import Enum, auto

class Ball:

    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.speedX = 0
        self.speedY = 0

    def move(self):
        self.x += self.speedX
        self.y += self.speedY

class PongGame:

    def __init__(self, room_name):
        self.instance_lock = Lock()
        self.channel_layer = get_channel_layer()
        self.room_name = room_name
        self.player1_score = 0
        self.player2_score = 0
    
    def execute(self):
        asyncio.run(self.send_messege_to_group("send_game_information", {"hoge": i}))
        

    #def game_closer(self)

    #def change_user_paddle_location(self)

    # send message to Group that belogs to this room
    async def send_messege_to_group(self, method_type, content):
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": method_type,
                "contents": content,
            }
        )
    


