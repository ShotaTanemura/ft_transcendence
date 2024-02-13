from channels.generic.websocket import AsyncWebsocketConsumer
import json

class MyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            # TODO:受信したメッセージを処理
            await self.send(text_data=json.dumps({
                'key': message
            }))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'key': 'Invalid JSON'
            }))

