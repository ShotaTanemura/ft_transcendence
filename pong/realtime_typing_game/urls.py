from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import get_user_match_result, get_available_roomid

app_name = "realtime_typing_game"
urlpatterns = [
    path(
        "api/v1/match-result/<str:name>",
        get_user_match_result,
        name="get-user-match-result",
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
