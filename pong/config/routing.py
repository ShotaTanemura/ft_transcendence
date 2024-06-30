from django.urls import re_path

from realtime.consumers.websocket.room_consumers import RoomConsumer 

websocket_urlpatterns = [
    re_path(r'ws/realtime/(?P<room_name>\w+)/$', RoomConsumer.as_asgi()),
]
