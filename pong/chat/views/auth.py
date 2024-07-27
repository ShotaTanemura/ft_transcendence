from pong.middleware.auth import getJwtPayloadCookie
from pong.utils.redis_client import redis_client


def verify_user(request):
    payload = getJwtPayloadCookie(request)
    uuid = payload.get("uuid", None)
    if not payload or not uuid:
        raise Exception("Invalid token")
    token = request.COOKIES.get("token")
    if redis_client.exists(token):
        raise Exception("Invalid token")
    return str(uuid)
