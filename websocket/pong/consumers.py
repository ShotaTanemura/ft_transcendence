from channels.generic.websocket import AsyncWebsocketConsumer
from .gameLogic import *
import json
import asyncio

class MyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.is_connected = True
        await self.accept()

    async def disconnect(self, close_code):
        self.websocket.close()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        # TODO: receiveが2回目以降呼ばれない。reason:while loop to keep updating the game
        update_player_position(text_data_json['key'])
        while self.is_connected:
            updatePong()
            game_data = {
                "ball": ball,
                "user": user,
                "com": com,
                "canvas": canvas,
            }
            json_data = json.dumps(game_data)
            try:
                await self.send(text_data=json_data)
            except websocket.exceptions.ConnectionClosedError:
                self.is_connected = False  # 安全のため切断状態をフラグに反映
                self.websocket.close()
                print("Connection closed, stopping the loop")
                break
            await asyncio.sleep(0.02)
