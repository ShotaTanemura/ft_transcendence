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
    PLAYER1 = "player1"
    PLAYER2 = "player2"

    def __init__(self, room_name):
        self.room_name = room_name
        self.channel_layer = get_channel_layer()
        # TODO: ゲーム終了フラグの定義場所は適切か？
        self.game_finished = False

    async def send_message_to_group(self, method_type, content):
        # print(f"{GREEN}send_message_to_group: {method_type}, {content}{RESET}")
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": method_type,
                "contents": content,
            },
        )


class Timer(MessageSender):
    def __init__(self, room_name):
        super().__init__(room_name)
        # TODO: test用の制限時間。本番は10秒にする
        self.time_limit = 10
        self.timer = self.time_limit
        self.running = True

    def start_countdown(self, player_to_input):
        def countdown():
            if self.running:
                while self.timer > 0:
                    time.sleep(0.1)
                    self.timer -= 0.1
                    # print(f"Timer: {self.timer:.1f}秒")
                    async_to_sync(self.send_message_to_group)(
                        "send_game_information",
                        {
                            "sender": "TypingGame",
                            "type": "countdown-timer",
                            "contents": {
                                "timer": round(self.timer, 1),
                            },
                        },
                    )
                if self.timer <= 0:  # 0秒以下になった場合の処理
                    print("Time's up!")
                    self.running = False
                    print(f"{GREEN}Game finished!{RESET}")
                    async_to_sync(self.send_message_to_group)(
                        "send_game_information",
                        {
                            "sender": "TypingGame",
                            "type": "time-up",
                            "contents": {
                                # 勝敗を判定。(負けたプレイヤーを送信)
                                "player": player_to_input,
                            },
                        },
                    )
                    self.game_finished = True
                    winner = self.PLAYER1 if player_to_input == self.PLAYER2 else self.PLAYER2
                    async_to_sync(self.send_message_to_group)(
                        "send_game_information",
                        {
                            "sender": "TypingGame",
                            "type": "game-finished",
                            "contents": {
                                "winner": winner,
                            },
                        },
                    )

        threading.Thread(target=countdown, daemon=True).start()

    def reset(self, player_to_input):
        self.timer = self.time_limit
        self.running = True
        print("Timerをリセットしました。")
        self.start_countdown(player_to_input)
class TypingGame(MessageSender):
    def __init__(self, room_name):
        super().__init__(room_name)
        self.selected_word = ""
        self.input_length = 0
        self.timer = Timer(room_name)
        self.words = self.load_words()
        self.player_to_input = self.PLAYER2

    # roommanager.pyから参加者の準備ができたら呼ばれる
    async def start_game(self):
        print(f"{GREEN}start_game()が呼ばれました{RESET}")
        await self.send_message_to_group(
            "send_game_information",
            {
                "sender": "TypingGame",
                "type": "start-game",
                "contents": {},
            },
        )
        await self.next_word()
        self.timer.start_countdown(self.player_to_input)

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
            print(f"{RED}Error: {csv_file_path} ファイルが見つかりません{RESET}")  # 赤色で表示
        except Exception as e:
            print(f"{RED}Error: {e}{RESET}")  # 赤色で表示
        print(f"{GREEN}words.csvファイルが読み込まれました{RESET}")
        print(f"{GREEN}Loaded {len(words)} words{RESET}")
        return words

    def change_player_to_input(self):
        if self.player_to_input == self.PLAYER1:
            self.player_to_input = self.PLAYER2
        else:
            self.player_to_input = self.PLAYER1

    async def next_word(self):
        self.input_length = 0
        self.selected_word = random.choice(self.words)
        self.change_player_to_input()
        self.timer.reset(self.player_to_input)
        print(f"{GREEN}Selected word: {self.selected_word}{RESET}")

        await self.send_message_to_group(
            "send_game_information",
            {
                "sender": "TypingGame",
                "type": "next-word",
                "contents": {
                    "word": self.selected_word,
                    "player": self.player_to_input,
                },
            },
        )

    async def handle_typing_input(self, input_key):
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
                        "contents": {
                            "word": self.selected_word,
                            "input_length": self.input_length,
                            "player": self.player_to_input,
                        },
                    },
                )
        else:
            await self.send_message_to_group(
                "send_game_information",
                {
                    "sender": "TypingGame",
                    "type": "incorrect-key",
                    "contents": {
                        "word": self.selected_word,
                        "input_length": self.input_length,
                        "player": self.player_to_input,
                    },
                },
            )

    async def recieve_player1_input(self, message_json):
        if self.player_to_input == self.PLAYER1 and not self.timer.game_finished:
            input_key = message_json["contents"]
            await self.handle_typing_input(input_key)

    async def recieve_player2_input(self, message_json):
        if self.player_to_input == self.PLAYER2 and not self.timer.game_finished:
            input_key = message_json["contents"]
            await self.handle_typing_input(input_key)