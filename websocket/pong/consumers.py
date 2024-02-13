from channels.generic.websocket import AsyncWebsocketConsumer
from .gameLogic import *
import json
import asyncio

class MyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        # TODO: receiveが2回目以降呼ばれない。reason:while loop to keep updating the game
        update_player_position(text_data_json['key'])
        while True:
            updatePong()
            game_data = {
                "ball": ball,
                "user": user,
                "com": com,
                "canvas": canvas,
            }
            json_data = json.dumps(game_data)
            await self.send(text_data=json_data)
            await asyncio.sleep(0.05)
