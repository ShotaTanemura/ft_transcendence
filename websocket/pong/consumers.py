from channels.generic.websocket import AsyncWebsocketConsumer
from .gameLogic import *
import json

class MyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
            text_data_json = json.loads(text_data)
            pongLoop(text_data_json['key'])
            game_data = {
                "ball": ball,
                "user": user,
                "com": com,
                "canvas": canvas,
            }
            json_data = json.dumps(game_data)
            await self.send(text_data=json_data)

