from django.db import models
from django.conf import settings

class FriendRequest(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="sender",
        null=False,
        blank=False,
        on_delete=models.CASCADE,
    )
    reciever = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="reciever",
        null=False,
        blank=False,
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"{self.sender.name}_requested_to_{self.reciever.name}_at_{str(self.created_at)}"

class Friend(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="user",
        null=False,
        blank=False,
        on_delete=models.CASCADE,
    )
    friend = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="friend",
        null=False,
        blank=False,
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"{self.user.name}_and_{self.friend.name}_became_friend_at_{str(self.created_at)}"
