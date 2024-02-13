from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/pong/', consumers.MyConsumer.as_asgi()),
]
