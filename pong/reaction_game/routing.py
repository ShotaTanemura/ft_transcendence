from django.urls import re_path
from .consumers import ReactionConsumer

websocket_urlpatterns = [
    re_path(r"^ws/reaction/(?P<room_id>\w+)/$", ReactionConsumer.as_asgi()),
]
