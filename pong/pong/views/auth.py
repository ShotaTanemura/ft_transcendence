import json
from django.http.response import JsonResponse
from pong.models import User
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
from django.conf import settings
from pong.middleware.auth import jwt_exempt, getJwtPayloadCookie
from pong.utils.create_response import create_token_response
from pong.utils.redis_client import redis_client
import jwt


@jwt_exempt
@csrf_exempt
def test(request):
    return JsonResponse({"message": "Hello, world!"})


@jwt_exempt
@csrf_exempt
def register(request):
    if request.method != "POST":
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"}, status=400
        )

    data = json.loads(request.body)

    if "name" not in data or "email" not in data or "password" not in data:
        return JsonResponse(
            {"message": "Invalid parameters", "status": "invalidParams"}, status=400
        )

    if (
        User.objects.filter(name=data["name"]).exists()
        or User.objects.filter(email=data["email"]).exists()
    ):
        return JsonResponse(
            {"message": "User already exists", "status": "registerConflict"}, status=409
        )

    user = User.objects.create_user(
        name=data["name"], email=data["email"], password=data["password"]
    )

    return JsonResponse({"uuid": user.uuid}, status=201)


@jwt_exempt
@csrf_exempt
def create_token(request):
    if request.method != "POST":
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"}, status=400
        )

    data = json.loads(request.body)

    if "email" not in data or "password" not in data:
        return JsonResponse(
            {"message": "Invalid parameters", "status": "invalidParams"}, status=400
        )

    user = User.objects.filter(email=data["email"]).first()

    if not user or not user.check_password(data["password"]):
        return JsonResponse(
            {"message": "User not found", "status": "userNotFound"}, status=404
        )

    return create_token_response(
        user.uuid, JsonResponse({"uuid": user.uuid}, content_type="application/json")
    )


@jwt_exempt
@csrf_exempt
def refresh_token(request):
    if request.method != "POST":
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"}, status=400
        )

    refresh_token = request.COOKIES.get("refresh_token")
    if not refresh_token:
        return JsonResponse(
            {"message": "Refresh token not provided", "status": "invalidParams"},
            status=400,
        )

    try:
        refresh_payload = jwt.decode(
            refresh_token,
            settings.JWT_AUTH["JWT_PUBLIC_KEY"],
            algorithms=[settings.JWT_AUTH["JWT_ALGORITHM"]],
        )
    except jwt.ExpiredSignatureError:
        return JsonResponse(
            {"message": "Refresh token has expired", "status": "invalidParams"},
            status=400,
        )
    except jwt.InvalidTokenError:
        return JsonResponse(
            {"message": "Invalid refresh token", "status": "invalidParams"}, status=400
        )

    user = User.objects.filter(uuid=refresh_payload["uuid"]).first()
    if not user:
        return JsonResponse(
            {"message": "User not found", "status": "userNotFound"}, status=404
        )

    return create_token_response(
        user.uuid, JsonResponse({"uuid": user.uuid}, content_type="application/json")
    )


@csrf_exempt
def verify_token(request):
    if request.method != "POST":
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"}, status=400
        )

    payload = getJwtPayloadCookie(request)
    uuid = payload.get("uuid", None)
    if not payload or not uuid:
        return JsonResponse(
            {"message": "unauthorized", "status": "unauthorized"}, status=401
        )
    token = request.COOKIES.get("token")
    if redis_client.exists(token):
        return JsonResponse(
            {"message": "unauthorized", "status": "unauthorized"}, status=401
        )
    return JsonResponse({"uuid": str(uuid)}, status=200)


@csrf_exempt
def revoke_token(request):
    if request.method != "POST":
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"}, status=400
        )
    token = request.COOKIES.get("token", None)
    payload = getJwtPayloadCookie(request)
    exp = payload["exp"]
    uuid = payload["uuid"]
    current_time = datetime.utcnow()
    exp_time = datetime.utcfromtimestamp(exp)
    ttl = int((exp_time - current_time).total_seconds())
    redis_client.setex(token, ttl, "blacklisted")
    return JsonResponse({"uuid": str(uuid)}, status=200)
