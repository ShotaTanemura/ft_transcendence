from django.http.response import JsonResponse
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
import jwt
import re
from pong.models.user import User
from pong.utils.redis_client import redis_client
from functools import wraps
from channels.db import database_sync_to_async


def jwt_exempt(view_func):
    @wraps(view_func)
    def _wrapped_view_func(request, *args, **kwargs):
        return view_func(request, *args, **kwargs)

    _wrapped_view_func.jwt_exempt = True
    return _wrapped_view_func


def getJwtPayload(token):
    if not token:
        return None
    try:
        payload = jwt.decode(
            token,
            settings.JWT_AUTH["JWT_PUBLIC_KEY"],
            algorithms=[settings.JWT_AUTH["JWT_ALGORITHM"]],
        )
    except jwt.ExpiredSignatureError or jwt.InvalidTokenError:
        return None
    return payload


def getUserByJwt(token):
    payload = getJwtPayload(token)
    if not payload:
        return None
    user = User.objects.filter(uuid=payload["uuid"]).first()
    if not user:
        return None
    return user


def getJwtPayloadCookie(request):
    token = request.COOKIES.get("token", None)
    if not token:
        return None
    payload = getJwtPayload(token)
    if not payload:
        return None
    return payload


class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_view(self, request, view_func, view_args, view_kwargs):
        if getattr(view_func, "jwt_exempt", False):
            return None

        if not getJwtPayloadCookie(request):
            return JsonResponse(
                {"message": "unauthorized", "status": "unauthorized"}, status=401
            )
        token = request.COOKIES.get("token")
        if redis_client.exists(token):
            return JsonResponse(
                {"message": "unauthorized", "status": "unauthorized"}, status=401
            )
        return None


class ChannelsJWTAuthenticationMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        headers = dict(scope["headers"])
        try:
            match = re.search(r"token=([^\s;]+)", headers[b"cookie"].decode("utf-8"))
            if not match:
                scope["user"] = AnonymousUser()
                return await self.app(scope, receive, send)
            token = match.group(1)
            scope["user"] = await database_sync_to_async(getUserByJwt)(token)
            if scope["user"] is None:
                scope["user"] = AnonymousUser()
                return await self.app(scope, receive, send)
            return await self.app(scope, receive, send)
        except Exception as e:
            print(f"Exception: {e}")
            scope["user"] = AnonymousUser()
            return await self.app(scope, receive, send)
