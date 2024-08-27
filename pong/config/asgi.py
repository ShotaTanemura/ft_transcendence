"""
ASGI config for mysite project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.urls import re_path
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django_asgi_app = application = get_asgi_application()

# import consumers here
from pong.middleware.auth import ChannelsJWTAuthenticationMiddleware
from realtime_pong_game.consumers import PlayerConsumer
from realtime_typing_game.consumers import TypingPlayerConsumer

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AllowedHostsOriginValidator(
            ChannelsJWTAuthenticationMiddleware(
                URLRouter(
                    [
                        re_path(
                            r"realtime-pong/(?P<room_name>\w+)/(?P<user_role>\w+)/$",
                            PlayerConsumer.as_asgi(),
                        ),
                        re_path(
                            r"realtime-typing/(?P<room_name>\w+)/$",
                            TypingPlayerConsumer.as_asgi(),
                        ),
                    ]
                )
            )
        ),
    }
)
