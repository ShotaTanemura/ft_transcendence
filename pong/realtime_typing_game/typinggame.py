import os
import csv
import random
import time
import threading
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

RED = "\033[91m"
GREEN = "\033[92m"
RESET = "\033[0m"


class MessageSender:
    def __init__(self, room_name):
        self.room_name = room_name
        self.channel_layer = get_channel_layer()

    async def send_message_to_group(self, method_type, content):
        print(f"{GREEN}send_message_to_group: {method_type}, {content}{RESET}")
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": method_type,
                "contents": content,
            },
        )


class Timer(MessageSender):
    def __init__(self,room_name):
        super().__init__(room_name)
        self.time_limit = 10
        self.timer = self.time_limit
        self.running = True
        self.decrease_timer = False

    def start_countdown(self):
        def countdown():
            while self.running and self.timer > 0:
                time.sleep(0.1)
                if self.decrease_timer == True: # 打ち間違えた時
                    self.decrease_timer = False
                    self.timer -= 2.0
                else: # 通常時
                    self.timer -= 0.1
                print(f"Timer: {self.timer:.1f}秒")
                async_to_sync(self.send_message_to_group)(
                    "send_game_information",
                    {
                        "sender": "TypingGame",
                        "type": "countdown-timer",
                        "contents": {
                            "timer": self.timer,
                        },
                    },
                )
            if self.timer <= 0:  # 0秒以下になった場合の処理
                print("Time's up!")
                self.running = False
                async_to_sync(self.send_message_to_group)(
                    "send_game_information",
                    {
                        "sender": "TypingGame",
                        "type": "time-up",
                    },
                )

        threading.Thread(target=countdown, daemon=True).start()

    def reset(self):
        self.timer = self.time_limit
        self.running = True
        print("Timerをリセットしました。")
        self.start_countdown()
    
    def decrease_time_limit(self, amount):
        self.time_limit = max(3, self.time_limit - amount)
        self.timer = self.time_limit  # 現在のタイマーを新しい制限時間にリセット
        print(f"制限時間が{self.time_limit}秒に減少しました。")

    def trigger_timer_decrease(self):
        self.decrease_timer = True


class TypingGame(MessageSender):
    def __init__(self, room_name):
        super().__init__(room_name)
        self.selected_word = ""
        self.input_length = 0
        self.timer = Timer(room_name)
        self.words = self.load_words()

    # roommanager.pyから参加者の準備ができたら呼ばれる
    async def start_game(self):
        print(f"{GREEN}start_game()が呼ばれました{RESET}")
        self.timer.start_countdown()
        await self.send_message_to_group(
            "send_game_information",
            {
                "sender": "TypingGame",
                "type": "start-game",
                "contents": {},
            },
        )
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
        self.timer.reset()
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
                        # TODO:  送信する内容の相談をする
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
                    # TODO: 送信する内容の相談をする
                    "contents": {
                        "word": self.selected_word,
                        "input_length": self.input_length,
                    },
                },
            )