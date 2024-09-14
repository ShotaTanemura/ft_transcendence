from django.urls import path
from .views import health

app_name = "chat"
urlpatterns = [
    path("api/v1/health", health.health, name="health"),
]
