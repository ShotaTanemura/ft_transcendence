import json
from django.http.response import JsonResponse
from pong.models.user import User, Users2FA
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
from django.conf import settings
from pong.middleware.auth import jwt_exempt, getJwtPayloadCookie, getJwtPayload
from pong.utils.create_response import (
    create_token_response,
    create_session_token_response,
)
from pong.utils.redis_client import redis_client
from pong.views.two_factor import is_valid_totp_code
import jwt
from django.contrib.auth import password_validation


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

    if (
        "name" not in data
        or "nickname" not in data
        or "email" not in data
        or "password" not in data
    ):
        return JsonResponse(
            {"message": "Invalid parameters", "status": "invalidParams"}, status=400
        )

    try:
        password_validation.validate_password(data["password"])
    except password_validation.ValidationError as e:
        print(e)
        return JsonResponse(
            {"message": "Invalid password", "status": "invalidPassword"}, status=400
        )

    if (
        User.objects.filter(name=data["name"]).exists()
        or User.objects.filter(email=data["email"]).exists()
        or User.objects.filter(nickname=data["nickname"]).exists()
    ):
        return JsonResponse(
            {"message": "User already exists", "status": "registerConflict"}, status=409
        )

    user = User.objects.create_user(
        name=data["name"],
        nickname=data["nickname"],
        email=data["email"],
        password=data["password"],
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

    tfa = Users2FA.objects.filter(user=user.uuid).first()

    if tfa.is_active:
        return create_session_token_response(
            user.uuid,
            JsonResponse(
                {
                    "message": "Password correct, but TOTP is required.",
                    "status": "2FAIsRequired",
                },
                status=401,
            ),
            exp_delta=timedelta(minutes=3),
            status="2FAPending",
            auth_level="partial",
        )

    return create_token_response(
        user.uuid, JsonResponse({"uuid": user.uuid}, content_type="application/json")
    )


@jwt_exempt
@csrf_exempt
def create_token_totp(request):
    if request.method != "POST":
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"}, status=400
        )

    session_token = request.COOKIES.get("session_token")
    if not session_token:
        return JsonResponse(
            {"message": "Session token not provided", "status": "invalidParams"},
            status=400,
        )
    try:
        session_payload = jwt.decode(
            session_token,
            settings.JWT_AUTH["JWT_PUBLIC_KEY"],
            algorithms=[settings.JWT_AUTH["JWT_ALGORITHM"]],
        )
    except jwt.ExpiredSignatureError:
        return JsonResponse(
            {"message": "Session token has expired", "status": "invalidParams"},
            status=400,
        )
    except jwt.InvalidTokenError:
        return JsonResponse(
            {"message": "Invalid Session token", "status": "invalidParams"}, status=400
        )

    status = session_payload.get("status")
    uuid = session_payload.get("uuid")
    if not status or not uuid or status != "2FAPending":
        print(session_payload)
        return JsonResponse(
            {"message": "Invalid Session token", "status": "invalidParams"}, status=400
        )

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError as e:
        logger.error("Invalid JSON: {e}")
        return JsonResponse(
            {"message": "Invalid JSON", "status": "invalidJson"}, status=400
        )

    code = data.get("code")
    if not code:
        return JsonResponse(
            {"message": "Invalid parameters", "status": "invalidParams"}, status=400
        )

    tfa = Users2FA.objects.filter(user=uuid).first()
    if not tfa or not tfa.is_active:
        return JsonResponse(
            {"message": "2FA is not activated", "status": "invalidParams"}, status=400
        )

    if not is_valid_totp_code(secret=tfa.secret, code=code):
        return JsonResponse(
            {"message": "OTP is invalid", "status": "invalidParams"}, status=400
        )

    return create_token_response(
        uuid, JsonResponse({"uuid": uuid}, content_type="application/json")
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

    if redis_client.exists(refresh_token):
        return JsonResponse(
            {"message": "unauthorized", "status": "unauthorized"}, status=401
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
    redis_client.setex(uuid, 120, "online")
    return JsonResponse({"uuid": str(uuid)}, status=200)


@csrf_exempt
def revoke_token(request):
    def blacklist_token(token):
        payload = getJwtPayload(token)
        if not payload:
            return
        exp = payload["exp"]
        uuid = payload["uuid"]
        current_time = datetime.utcnow()
        exp_time = datetime.utcfromtimestamp(exp)
        ttl = int((exp_time - current_time).total_seconds())
        redis_client.setex(token, ttl, "blacklisted")
        return uuid

    if request.method != "POST":
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"}, status=400
        )
    uuid = None
    token = request.COOKIES.get("token", None)
    refresh_token = request.COOKIES.get("refresh_token", None)
    if not token and not refresh_token:
        return JsonResponse(
            {"message": "Invalid parameters", "status": "invalidParams"}, status=400
        )
    if token:
        uuid = blacklist_token(token)
    if refresh_token:
        uuid = blacklist_token(refresh_token)
    return JsonResponse({"uuid": str(uuid)}, status=200)
