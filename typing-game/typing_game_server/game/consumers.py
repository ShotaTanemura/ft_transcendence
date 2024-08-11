# consumers.py

import json
import random
from channels.generic.websocket import AsyncWebsocketConsumer

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

        # words.csvを読み込んで単語リストを作成
        with open('game/words.csv', 'r') as file:
            words = [line.strip() for line in file.readlines()]

        self.words = words
        self.current_word = random.choice(self.words)
        self.score = 0
        self.time_left = 15

        await self.send(text_data=json.dumps({
            'word': self.current_word,
            'score': self.score,
            'time_left': self.time_left,
        }))

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        input_char = data['char']

        if input_char == self.current_word[0]:
            self.score += 1
            self.current_word = self.current_word[1:]
            if not self.current_word:
                self.current_word = random.choice(self.words)
        else:
            self.time_left -= 2

        await self.send(text_data=json.dumps({
            'word': self.current_word,
            'score': self.score,
            'time_left': self.time_left,
        }))
