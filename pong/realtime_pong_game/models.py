from django.db import models
from django.conf import settings


class TournamentInfo(models.Model):
    tournament_name = models.CharField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now=True)
    winner = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )

    def __str__(self):
        return self.tournament_name


class MatchInfo(models.Model):
    tournament_info = models.ForeignKey(
        TournamentInfo, on_delete=models.CASCADE, null=False, blank=False
    )
    player1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="player1",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    player2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="player2",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    player1_score = models.SmallIntegerField(default=0, null=False, blank=False)
    player2_score = models.SmallIntegerField(default=0, null=False, blank=False)
    created_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.player1.name}_vs_{self.player2.name}_in_{self.tournament_info}_at_{str(self.created_at)}"
