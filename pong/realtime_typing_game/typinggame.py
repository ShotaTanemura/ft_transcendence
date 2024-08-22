import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import time
import threading

TIME_LIMIT = 10

class Timer:
    def __init__(self):
        self.timer = TIME_LIMIT
        self.running = True
        self._start_countdown()

    def _start_countdown(self):
        def countdown():
            while self.running and self.timer > 0:
                time.sleep(0.1)
                self.timer -= 0.1
                print(f"Timer: {self.timer:.1f}秒")
            if self.timer <= 0:  # 0秒以下になった場合の処理
                print("Time's up!")
                self.running = False
        threading.Thread(target=countdown, daemon=True).start()

    def reset(self):
        self.timer = TIME_LIMIT
        print("Timerをリセットしました。")
        self._start_countdown()
    # TODO: タイマー減少処理の追加
    # TODO: タイマーの制限時間の減少の追加

class TypingGame:
    def __init__(self, room_name):
        self.room_name = room_name
        self.channel_layer = get_channel_layer()

    async def handle_typing_input(self, participant, message_json):
        print(f"Participant: {participant} sent: {message_json['contents']}")
        # TODO: ゲームロジックの処理
        await self.send_messege_to_group(
            "send_game_information",
            {
                "sender": "TypingGame",
                "type": "typing-input",
                "contents": {
                    "message": message_json["contents"],
                    "sender": participant.name,
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
