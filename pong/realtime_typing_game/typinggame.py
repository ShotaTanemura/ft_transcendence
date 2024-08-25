import os
import csv
import random
import time
import threading
from channels.layers import get_channel_layer

TIME_LIMIT = 10
RED = "\033[91m"
GREEN = "\033[92m"
RESET = "\033[0m"


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
        self.selected_word = ""
        self.input_length = 0
        self.channel_layer = get_channel_layer()
        self.words = self.load_words()

    # roommanager.pyから参加者の準備ができたら呼ばれる
    async def start_game(self):
        print(f"{GREEN}start_game()が呼ばれました{RESET}")
        await self.next_word()

    def load_words(self):
        words = []
        csv_file_path = os.path.join(os.path.dirname(__file__), "words.csv")
        try:
            with open(csv_file_path, newline="", encoding="utf-8") as csvfile:
                reader = csv.reader(csvfile)
                next(reader)  # ヘッダーをスキップ
                for row in reader:
                    word = row[0].strip()  # 単語をトリムしてリストに追加
                    if word:
                        words.append(word)
        except FileNotFoundError:
            print(
                f"{RED}Error: {csv_file_path} ファイルが見つかりません{RESET}"
            )  # 赤色で表示
        except Exception as e:
            print(f"{RED}Error: {e}{RESET}")  # 赤色で表示
        print(f"{GREEN}words.csvファイルが読み込まれました{RESET}")
        print(f"{GREEN}Loaded {len(words)} words{RESET}")
        return words

    async def next_word(self):
        self.selected_word = ""
        self.input_length = 0
        self.selected_word = random.choice(self.words)
        print(f"{GREEN}Selected word: {self.selected_word}{RESET}")

        await self.send_message_to_group(
            "send_game_information",
            {
                "sender": "TypingGame",
                "type": "next-word",
                "contents": {
                    "word": self.selected_word,
                },
            },
        )

    async def handle_typing_input(self, participant, message_json):
        print(f"Participant: {participant} sent: {message_json['contents']}")
        input_key = message_json["contents"]

        # 入力された文字が正解の場合
        if (
            self.input_length < len(self.selected_word)
            and input_key == self.selected_word[self.input_length]
        ):
            self.input_length += 1
            print(
                f"{GREEN}Correct! {self.input_length}/{len(self.selected_word)}{RESET}"
            )
            if self.input_length == len(self.selected_word):
                await self.next_word()
            else:
                await self.send_message_to_group(
                    "send_game_information",
                    {
                        "sender": "TypingGame",
                        "type": "correct-key",
                        # TODO: 送信する内容の相談
                        "contents": {
                            "word": self.selected_word,
                            "input_length": self.input_length,
                        },
                    },
                )
        else:
            await self.send_message_to_group(
                "send_game_information",
                {
                    "sender": "TypingGame",
                    "type": "incorrect-key",
                    # TODO: 送信する内容の相談
                    "contents": {
                        "word": self.selected_word,
                        "input_length": self.input_length,
                    },
                },
            )

    async def send_message_to_group(self, method_type, content):
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": method_type,
                "contents": content,
            },
        )
