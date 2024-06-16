from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy
import operator
from functools import reduce

User = get_user_model()


class RoomQuerySelect(models.QuerySet):
    def filtering(self, keywords='', order='-created_at'):
        condition = reduce(operator.or_, (models.Q(name__icontains=word) for word in keywords.split()))

        return self.filter(condition).order_by(order).distrinct();

class Room(models.Model):
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name="host")
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="winner")
    name = models.CharField(gettext_lazy('Room name'), max_length=64)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(gettext_lazy('Created time'), default=timezone.now)
    closed_at = models.DateTimeField(gettext_lazy('Closed time'), default=None)

    objects = RoomQuerySelect.as_manager()

    def __str__(self):
        return self.__unicode__()

    def __unicode__(self):
        return self.name
 
    def set_host(self, user=None):
        if user is not None:
            self.host = user

    def is_host(self, user=None):
            return (user is not None and self.host.pk == user.pk)
    

class UserRoomsManager(models.Manager):
    def ordering(self, order='created_at'):
        return self.get_queryset().order_by(order)

class UserRooms(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    created_at = models.DateTimeField(gettext_lazy('Created time'), default=timezone.now)

    objects = UserRoomsManager()

class MatchInfo(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user1")
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user2")
    user1_score = models.IntegerField(default=0)
    user2_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(gettext_lazy('Created time'), default=timezone.now)