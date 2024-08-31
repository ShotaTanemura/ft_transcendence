from django.urls import path
from .views import test
from .views.rooms import rooms, unjoined

app_name = "chat"
urlpatterns = [
    path("api/v1/test", test.test, name="test"),
    path("api/v1/rooms", rooms.handle_rooms, name="handle_rooms"),
    path("api/v1/rooms/unjoined", unjoined.handle_unjoined_rooms, name="unjoined"),
]
