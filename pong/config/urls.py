"""
URL configuration for mysite project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from pong.views.index import index

urlpatterns = [
    path(settings.ADMIN_PANEL_URL, admin.site.urls),
    path("pong/", include("pong.urls")),
    path("metrics/", include("django_prometheus.urls")),
    path("chat/", include("chat.urls")),
    path("ponggame/", include("realtime_pong_game.urls")),
    path("typinggame/", include("realtime_typing_game.urls")),
    path("reactiongame/", include("reaction_game.urls")),
    re_path(r"^.*$", index, name="index"),
]
