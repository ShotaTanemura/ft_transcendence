from django.contrib import admin
from realtime_pong_game.models import RoomInfo, MatchInfo, RoomParticipantMapper

admin.site.register(RoomInfo)
admin.site.register(MatchInfo)
admin.site.register(RoomParticipantMapper)
