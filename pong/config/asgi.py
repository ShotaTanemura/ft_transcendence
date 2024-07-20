"""
ASGI config for mysite project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.urls import path
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django_asgi_app = application = get_asgi_application()

# import consumers here
from .consumers import SampleConsumer 
from pong.middleware.auth import ChannelsJWTAuthenticationMiddleware

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        ChannelsJWTAuthenticationMiddleware(
            URLRouter([
                path("test/", SampleConsumer.as_asgi()),
                #path("chat/", PublicChatConsumer.as_asgi()), 
            ])
        )
    ),
})
