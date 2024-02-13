# URLパターンとWebSocketコンシューマーを紐付けるファイルです。

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import pong.routing

application = ProtocolTypeRouter({
    'websocket': URLRouter(
            pong.routing.websocket_urlpatterns
        ),
})
