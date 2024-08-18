import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class TypingGame:
    def __init__(self, room_name):
        self.room_name = room_name
        self.channel_layer = get_channel_layer()

    async def handle_typing_input(self, message_json):
        # 受信したキー入力をprintする
        print(f"Received input: {message_json['contents']}")
        
        # 必要に応じて、クライアントにメッセージを送信する
        await self.send_messege_to_group("send_typing_input", message_json)

    async def send_messege_to_group(self, method_type, content):
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": method_type,
                "contents": content,
            },
        )
