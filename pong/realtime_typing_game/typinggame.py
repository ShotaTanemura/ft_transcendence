import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import time
import threading
import os
import csv

TIME_LIMIT = 10
RED = "\033[91m"
GREEN = "\033[92m"
RESET = "\033[0m"

# 単語の処理が終わり次第、追加
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
        self.words = self.load_words()

    def load_words(self):
        words = []
        csv_file_path = os.path.join(os.path.dirname(__file__), 'words.csv')
        try:
            with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.reader(csvfile)
                next(reader)  # ヘッダーをスキップ
                for row in reader:
                    word = row[0].strip()  # 単語をトリムしてリストに追加
                    if word:
                        words.append(word)
        except FileNotFoundError:
            print(f"{RED}Error: {csv_file_path} ファイルが見つかりません{RESET}")  # 赤色で表示
        except Exception as e:
            print(f"{RED}Error: {e}{RESET}")  # 赤色で表示
        print(f"{GREEN}words.csvファイルが読み込まれました{RESET}")  # 緑色で表示
        print(f"{GREEN}Loaded {len(words)} words{RESET}")
        return words

    # TODO: start_gameメソッドの追加
    # TODO: 単語の送信
    
    # TODO: runメソッドの追加
    # TODO: keyを受信し、単語の正誤判定処理の追加
    # 正解の単語と入力された単語の文字数を保持
    

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
