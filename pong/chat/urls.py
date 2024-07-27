from django.urls import path
from .views import test, chat_room, room_status

app_name = "chat"
urlpatterns = [
    path("api/v1/test", test.test, name="test"),
    path("api/v1/create_chat_room", chat_room.create_chat_room, name="create_chat_room"),
    path("api/v1/room_status", room_status.room_status, name="room_status"),
]
