from django.urls import path
from .views import test, user_room, rooms

app_name = "chat"
urlpatterns = [
    path("api/v1/test", test.test, name="test"),
    path(
        "api/v1/rooms", rooms.post, name="rooms_post"
    ),
    path("api/v1/rooms/search", rooms.search_rooms, name="searh_rooms"),
    path("api/v1/rooms", rooms.rooms, name="rooms"),
    path("api/v1/user_room", user_room.user_room, name="user_room"),
]
