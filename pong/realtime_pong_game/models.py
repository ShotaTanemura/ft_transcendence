from django.db import models
from django.conf import settings


class RoomInfo(models.Model):
    room_name = models.CharField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now=True)
    winner = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )


class RoomParticipantMapper(models.Model):
    room_info = models.ForeignKey(
        RoomInfo, on_delete=models.CASCADE, null=False, blank=False
    )
    participant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=False,
        blank=False,
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now=True)


class MatchInfo(models.Model):
    room_info = models.ForeignKey(
        RoomInfo, on_delete=models.CASCADE, null=False, blank=False
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
    winner = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL
    )
