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

    def add_room(self, room_name, host_uuid):
        if (self.get_active_room_by_name(room_name) != None):
            raise RuntimeError('add_room: The room has already been existed !')
        host = User.objects.get_user_from_uuid(host_uuid)
        if host == None:
            raise RuntimeError('User does not exsits !')
        new_room = Room(host=host, winner=None, name=room_name, is_active=True, created_at=timezone.now())
        new_room.save()

    def get_active_room_by_name(self, room_name):
        return self.filter(name=room_name, is_active=True).first()

class Room(models.Model):
    host = models.ForeignKey(User, related_name="host", on_delete=models.SET_NULL, null=True, default=None)
    winner = models.ForeignKey(User, related_name="winner", on_delete=models.SET_NULL, null=True, default=None)
    name = models.CharField(gettext_lazy('Room name'), max_length=64, default=None)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(gettext_lazy('Created time'), default=timezone.now())
    closed_at = models.DateTimeField(gettext_lazy('Closed time'), blank=True, null=True, default=None)
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
    
class UserRoomMappingManager(models.Manager):
    def ordering(self, order='created_at'):
        return self.get_queryset().order_by(order)

    def join_room(self, room_name, user_uuid):
        room = Room.objects.get_active_room_by_name(room_name)
        if room == None:
            raise RuntimeError('Room does not exsits !')
        user = User.objects.get_user_from_uuid(user_uuid)
        if user == None:
            raise RuntimeError('User does not exsits !')
        new_user_room_mapping = UserRoomMapping(user=user, room=room, created_at=timezone.now())
        new_user_room_mapping.save()

    def get_user_names_of_room(self, room_name):
        user_names_list = []
        room = Room.objects.get_active_room_by_name(room_name)
        if room == None:
            raise RuntimeError('Room does not exsits')
        user_room_mapping = self.filter(room=room)
        for user_room in user_room_mapping:
            user_names_list.append(user_room.user.name)
        return (user_names_list)


class UserRoomMapping(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    created_at = models.DateTimeField(gettext_lazy('Created time'), default=timezone.now())
    objects = UserRoomMappingManager()


class MatchInfo(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user1")
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user2")
    user1_score = models.IntegerField(default=0)
    user2_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(gettext_lazy('Created time'), default=timezone.now())