from django.urls import path
from .views import test, user_room, rooms

app_name = "chat"
urlpatterns = [
    path("api/v1/test", test.test, name="test"),
    path( "api/v1/rooms", rooms.handle_rooms, name="handle_rooms"),
]
