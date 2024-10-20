from django.db import models
from pong.models.user import User


class GameRecord(models.Model):
    user = models.ForeignKey(
        User, related_name="user_records", on_delete=models.CASCADE
    )
    opponent = models.ForeignKey(
        User, related_name="opponent_records", on_delete=models.CASCADE
    )
    winner = models.ForeignKey(User, related_name="won_games", on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} vs {self.opponent.username} - Winner: {self.winner.username} at {self.timestamp}"
