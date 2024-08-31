from django.urls import path
from .views import test
from .views.rooms import rooms, unjoined, messages

app_name = "chat"
urlpatterns = [
    path("api/v1/test", test.test, name="test"),
    path("api/v1/rooms", rooms.handle_rooms, name="handle_rooms"),
    path("api/v1/rooms/unjoined", unjoined.handle_unjoined_rooms, name="unjoined"),
    path("api/v1/rooms/<str:uuid>", messages.handle_room_messages, name="room_messages"),
]