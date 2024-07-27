from pong.middleware.auth import getJwtPayloadCookie
from pong.utils.redis_client import redis_client
from chat.utils.error import AppError, UnauthorizedError
from pong.models import User
from logging import getLogger

logger = getLogger(__name__)


def verify_user(request):
    payload = getJwtPayloadCookie(request)
    uuid = payload.get("uuid", None)
    if not payload or not uuid:
        raise UnauthorizedError("Unauthorized")
    token = request.COOKIES.get("token")
    if redis_client.exists(token):
        raise UnauthorizedError("Unauthorized")

    user = User.objects.get(uuid=uuid)
    return user
