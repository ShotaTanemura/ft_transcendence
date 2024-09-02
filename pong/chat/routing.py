# chat/routing.py
from django.urls import re_path
from . import chat_consumers, room_consumers

websocket_urlpatterns = [
    re_path(r"^ws/chat/rooms/?$", room_consumers.RoomConsumer.as_asgi()),  # 全体的な通知
    re_path(r"ws/chat/(?P<room_name>[\w-]+)/$", chat_consumers.ChatConsumer.as_asgi()),  # 各部屋固有のチャット
]