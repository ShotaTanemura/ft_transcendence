from django.urls import path
from .views import test
from .views import chat_room

app_name = "chat"
urlpatterns = [
    path("api/v1/test", test.test, name="test"),
    path("api/v1/create_chat_room", chat_room.create_chat_room, name="create_chat_room"),
]
