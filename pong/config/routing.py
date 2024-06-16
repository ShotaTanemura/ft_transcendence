from django.urls import re_path

from realtime.consumers.websocket.consumers import GameConsumer 

websocket_urlpatterns = [
    re_path(r'ws/realtime/(?P<room_name>\w+)/$', GameConsumer.as_asgi()),
]
