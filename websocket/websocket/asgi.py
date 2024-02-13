import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import pong.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'websocket.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": URLRouter(
            pong.routing.websocket_urlpatterns
        ),
})
