import os
import csv
import random
import time
import threading
from channels.layers import get_channel_layer
from asgiref.sync import sync_to_async
from asgiref.sync import async_to_sync
from realtime_typing_game.models import MatchInfo

RED = "\033[91m"
GREEN = "\033[92m"
RESET = "\033[0m"
DEBUG = False


class Timer:
    def __init__(self, send_message_to_group, handle_game_finished):
        # TODO: 10秒に戻す
        self.time_limit = 10
        self.timer = self.time_limit
        self.thread_running = False
        self.game_finished = False
        self.send_message_to_group = send_message_to_group
        self.handle_game_finished = handle_game_finished

    def start_countdown(self):
        def countdown():
            self.thread_running = True
            while self.timer > 0 and not self.game_finished:
                time.sleep(0.1)
                self.timer -= 0.1
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

            if self.timer <= 0 and not self.game_finished:
                self.handle_game_finished()

        if not self.thread_running:
            threading.Thread(target=countdown, daemon=True).start()

    def reset(self):
        self.timer = self.time_limit
        self.start_countdown()


class TypingGame:
    PLAYER1 = "player1"
    PLAYER2 = "player2"
    players = {PLAYER1: "", PLAYER2: ""}

    def __init__(self, room_name):
        self.room_name = room_name
        self.channel_layer = get_channel_layer()
        self.typing_game_info = None
        self.player_to_input = self.PLAYER2
        self.selected_word = ""
        self.input_length = 0
        self.timer = Timer(self.send_message_to_group, self.handle_game_finished)
        self.words = self.load_words()

    async def send_message_to_group(self, method_type, content):
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type": method_type,
                "contents": content,
            },
        )

    def set_player_name(self, player, participant):
        self.players[player] = participant

    def set_player1_name(self, participant):
        self.set_player_name(self.PLAYER1, participant)

    def set_player2_name(self, participant):
        self.set_player_name(self.PLAYER2, participant)

    def get_player_name(self, player):
        return str(self.players.get(player))

    def get_winner_player(self):
        return self.PLAYER1 if self.player_to_input == self.PLAYER2 else self.PLAYER2

    def get_winner_player_user_object(self):
        return self.players.get(self.get_winner_player())

    def get_winner_player_name(self):
        return self.get_player_name(self.get_winner_player())

    def create_typing_game_record(self):
        try:
            player1 = self.players.get(self.PLAYER1)
            player2 = self.players.get(self.PLAYER2)

            if not player1 or not player2:
                print(f"{RED}Error: Player not found{RESET}")
                return

            self.typing_game_info = MatchInfo.objects.create(
                player1=player1,
                player2=player2,
            )
            self.typing_game_info.save()
            print(f"{GREEN}TypingGameInfo created: {self.typing_game_info}{RESET}")

        except Exception as e:
            print(f"{RED}Error during creating TypingGameInfo: {str(e)}{RESET}")

    def update_winner_in_db(self):
        if self.typing_game_info:
            self.typing_game_info.winner = self.get_winner_player_user_object()
            self.typing_game_info.save()
        else:
            print(f"{RED}Error: typingGameInfo is not set{RESET}")

    def handle_game_finished(self):
        print(f"{GREEN}Game finished!{RESET}")
        self.timer.game_finished = True
        self.update_winner_in_db()
        async_to_sync(self.send_message_to_group)(
            "send_game_information",
            {
                "sender": "TypingGame",
                "type": "game-finished",
                "contents": {
                    "winner": str(self.players.get(self.get_winner_player())),
                },
            },
        )
        async_to_sync(self.send_message_to_group)(
            "send_disconnect_notification",
            {
                "sender": "TypingGame",
                "type": "game-finished-disconnect",
                "contents": {},
            },
        )
        self.thread_running = False

    async def start_game(self):
        await sync_to_async(self.create_typing_game_record)()
        await self.send_message_to_group(
            "send_game_information",
            {
                "sender": "TypingGame",
                "type": "start-game",
                "contents": {},
            },
        )
        await self.next_word()
        self.timer.start_countdown()

    def change_player_to_input(self):
        if self.player_to_input == self.PLAYER1:
            self.player_to_input = self.PLAYER2
        else:
            self.player_to_input = self.PLAYER1

    async def next_word(self):
        self.input_length = 0
        self.selected_word = random.choice(self.words)
        self.change_player_to_input()
        self.timer.reset()
        print(f"{GREEN}Selected word: {self.selected_word}{RESET}")
        await self.send_message_to_group(
            "send_game_information",
            {
                "sender": "TypingGame",
                "type": "next-word",
                "contents": {
                    "word": self.selected_word,
                    "player": self.get_player_name(self.player_to_input),
                },
            },
        )

    def load_words(self):
        words = []
        csv_file_path = os.path.join(os.path.dirname(__file__), "words.csv")
        try:
            with open(csv_file_path, newline="", encoding="utf-8") as csvfile:
                reader = csv.reader(csvfile)
                next(reader)  # ヘッダーをスキップ
                for row in reader:
                    word = row[0].strip()
                    if word:
                        words.append(word)
        except FileNotFoundError:
            print(f"{RED}Error: {csv_file_path} ファイルが見つかりません{RESET}")
        except Exception as e:
            print(f"{RED}Error: {e}{RESET}")
        print(f"{GREEN}words.csvファイルが読み込まれました{RESET}")
        print(f"{GREEN}Loaded {len(words)} words{RESET}")
        return words

    async def handle_typing_input(self, input_key):
        if (
            self.input_length < len(self.selected_word)
            and input_key == self.selected_word[self.input_length]
        ):
            self.input_length += 1
            if DEBUG:
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
                            "player": self.get_player_name(self.player_to_input),
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
                        "player": self.get_player_name(self.player_to_input),
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
