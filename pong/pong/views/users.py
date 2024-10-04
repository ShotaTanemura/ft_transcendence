from django.http.response import JsonResponse
from django.db.utils import IntegrityError
from django.contrib.auth.models import AnonymousUser
from django.views.decorators.csrf import csrf_exempt
from pong.utils.redis_client import redis_client
from pong.models.user import User, UserIconUpdateForm
from pong.models.friend import Friend, FriendRequest, FriendStatus
from pong.middleware.auth import jwt_exempt
import json
import logging

logger = logging.getLogger(__name__)


@csrf_exempt
def user(request, uuid):
    try:
        user = User.objects.filter(uuid=uuid).first()
        if not user:
            return JsonResponse(
                {"message": "User not found", "status": "userNotFound"}, status=404
            )
        if request.user != user:
            return JsonResponse(
                {"message": "unauthorized", "status": "unauthorized"}, status=401
            )
        if request.method == "GET":
            return JsonResponse(
                {
                    "uuid": user.uuid,
                    "name": user.name,
                    "email": user.email,
                    "icon": user.icon.url if user.icon else None,
                },
                status=200,
            )
        elif request.method == "PATCH":
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError as e:
                logger.error("Invalid JSON: {e}")
                return JsonResponse(
                    {"message": "Invalid JSON", "status": "invalidJson"}, status=400
                )

            if data["name"]:
                user.name = data["name"]
            if data["email"]:
                user.email = data["email"]
            try:
                user.save()
            except IntegrityError as e:
                return JsonResponse(
                    {
                        "message": "User or email already exists",
                        "status": "registerConflict",
                    },
                    status=409,
                )
            except Exception as e:
                return JsonResponse(
                    {"message": "Error saving user", "status": "saveFailed"}, status=500
                )

            return JsonResponse(
                {
                    "uuid": user.uuid,
                    "name": user.name,
                    "email": user.email,
                    "icon": user.icon.url if user.icon else None,
                },
                status=200,
            )
        else:
            return JsonResponse(
                {"message": "Method is not allowed", "status": "invalidParams"},
                status=400,
            )
    except Exception as e:
        logger.error(f"Server error: {e}")
        return JsonResponse(
            {"message": "Internal Server Error", "status": "serverError"}, status=500
        )


@csrf_exempt
def user_icon(request, uuid):
    user = User.objects.filter(uuid=uuid).first()
    if not user:
        return JsonResponse(
            {"message": "User not found", "status": "userNotFound"}, status=404
        )

    if request.user != user:
        return JsonResponse(
            {"message": "unauthorized", "status": "unauthorized"}, status=401
        )

    if request.method != "POST":
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"}, status=400
        )

    icon = request.FILES.get("icon", None)
    if not icon:
        return JsonResponse(
            {"message": "Invalid parameters", "status": "invalidParams"}, status=400
        )

    form = UserIconUpdateForm(request.POST, request.FILES, instance=user)
    if not form.is_valid():
        return JsonResponse(
            {"message": "Invalid parameters", "status": "invalidParams"}, status=400
        )
    form.save()

    return JsonResponse(
        {
            "uuid": user.uuid,
            "name": user.name,
            "email": user.email,
            "icon": user.icon.url,
        },
        status=200,
    )


@csrf_exempt
def other_user(request, name):
    if request.method != "GET":
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"}, status=400
        )
    user = User.objects.filter(name=name).first()
    if not user:
        return JsonResponse(
            {"message": "User not found", "status": "userNotFound"}, status=404
        )
    return JsonResponse({"name": user.name, "icon": user.icon.url}, status=200)


@csrf_exempt
def searched_users(request, name):
    try:
        if request.method != "GET":
            return JsonResponse(
                {"message": "Method is not allowed", "status": "invalidParams"},
                status=400,
            )
        if request.user == AnonymousUser:
            return JsonResponse(
                {"message": "unauthorized", "status": "unauthorized"}, status=401
            )

        users = User.objects.filter(name__icontains=name)
        if not users:
            return JsonResponse(
                {"message": "Users not found", "status": "userNotFound"}, status=404
            )
        hitted_user_list = []
        for user in users:
            friend_status = 0
            friend = Friend.objects.filter(user=request.user, friend=user).exists()
            send_friend_request = FriendRequest.objects.filter(
                sender=request.user, reciever=user
            ).exists()
            approve_friend_request = FriendRequest.objects.filter(
                sender=user, reciever=request.user
            ).exists()
            if friend:
                friend_status = int(FriendStatus.FRIEND)
            elif send_friend_request:
                friend_status = int(FriendStatus.PENDING)
            elif approve_friend_request:
                friend_status = int(FriendStatus.REQUESTED)
            elif user == request.user:
                friend_status = int(FriendStatus.YOURSELF)
            hitted_user_list.append(
                {
                    "name": user.name,
                    "icon": user.icon.url if user.icon else None,
                    "friend_status": friend_status,
                }
            )

        return JsonResponse(
            {"users": hitted_user_list},
            status=200,
        )
    except Exception as e:
        logger.error(f"Server error: {e}")
        return JsonResponse(
            {"message": "Internal Server Error", "status": "serverError"}, status=500
        )


@csrf_exempt
def user_status(request, name):
    if request.method != "GET":
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"}, status=400
        )
    user = User.objects.filter(name=name).first()
    if not user:
        return JsonResponse(
            {"message": "User not found", "status": "userNotFound"}, status=404
        )
    user_online_status = redis_client.get(str(user.uuid))
    if user_online_status:
        return JsonResponse(
            {"name": user.name, "status": user_online_status.decode("utf-8")},
            status=200,
        )
    return JsonResponse({"name": user.name, "status": "offline"}, status=200)
