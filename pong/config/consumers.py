from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

class SampleConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        if self.scope["user"] == AnonymousUser():
            await self.close()
            print("Unauthorized")
            return
        self.user = self.scope["user"]
        print("Authorized")
        print(f"name: {self.user}")
        await self.accept()

    async def receive(self, text_data=None, bytes_data=None):
        print(text_data)

    async def disconnect(self, close_code):
        await self.close()
