from django.urls import path
from .views import test, chat_room, room_status,rooms

app_name = "chat"
urlpatterns = [
    path("api/v1/test", test.test, name="test"),
    path(
        "api/v1/create_chat_room", chat_room.create_chat_room, name="create_chat_room"
    ),
    path("api/v1/room_status", room_status.room_status, name="room_status"),
    path("api/v1/rooms/search", rooms.search_rooms, name="searh_rooms"),
    path("api/v1/rooms", rooms.rooms, name="rooms"),
]
