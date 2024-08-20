import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


class TypingGame:
    def __init__(self, room_name):
        self.room_name = room_name
        self.channel_layer = get_channel_layer()

    async def handle_typing_input(self, participant, message_json):
        print(f"Participant {participant} sent: {message_json['contents']}")
        await self.send_messege_to_group(
            "send_game_information",
            {
                "sender": "TypingGame",
                "type": "typing-input",
                "contents": {
                    "message": message_json["contents"],
                },
            },
        )

    async def send_messege_to_group(self, method_type, content):
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": method_type,
                "contents": content,
            },
        )
