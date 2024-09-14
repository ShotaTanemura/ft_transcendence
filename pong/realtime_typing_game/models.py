from django.db import models
from django.conf import settings

class TypingGameInfo(models.Model):
    # TODO: 日本時間にする
    created_at = models.DateTimeField(auto_now=True)
    winner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="typing_games_as_winner",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    player1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="typing_games_as_player1",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    player2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="typing_games_as_player2",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    def __str__(self):
        return f"{self.player1.name}_vs_{self.player2.name}_at_{str(self.created_at)}"