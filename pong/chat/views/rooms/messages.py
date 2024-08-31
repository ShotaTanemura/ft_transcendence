import json
from django.http.response import JsonResponse
from pong.models import UserManager
from pong.models import User
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
import jwt
from django.conf import settings
from django.http.response import HttpResponse
from django.db.models import Q
from pong.middleware.auth import jwt_exempt, getUserByJwt
from chat.views.auth import verify_user
from logging import getLogger
from chat.utils.error import AppError, UnauthorizedError
from chat.models import Rooms

logger = getLogger(__name__)

def room_access_check(user_id, room_id):
    room = Rooms.objects.get(uuid=room_id)
    if not room:
        raise AppError("部屋が見つかりません", 404)
    if not room.userrooms_set.filter(user_id=user_id).exists():
        raise UnauthorizedError("部屋にアクセスする権限がありません")

def handle_get_room_messages(request, user):
    try:
        # room_access_check(user.uuid, request.GET.get("room_id"))
        return JsonResponse({ "uuid": "room-12345", "name": "General Chat", "messages": [ { "sender": "Alice", "text": "Hello, everyone!", "timestamp": "2024-08-31T12:34:56Z" }, { "sender": "Bob", "text": "Hi Alice!", "timestamp": "2024-08-31T12:35:10Z" } ] }, status=200)
    except AppError as e:
        logger.error(e)
        return JsonResponse(e.to_dict(), status=e.status_code)
    except Exception as e:
        logger.error(e)
        return JsonResponse({"message": str(e)}, status=500)


def handle_post_room_message(request, user):
    try:
        return JsonResponse({ "uuid": "room-12345", "name": "General Chat", "messages": [ { "sender": "Alice", "text": "Hello, everyone!", "timestamp": "2024-08-31T12:34:56Z" }, { "sender": "Bob", "text": "Hi Alice!", "timestamp": "2024-08-31T12:35:10Z" } ] }, status=200)

    except AppError as e:
        logger.error(e)
        return JsonResponse(e.to_dict(), status=e.status_code)
    except Exception as e:
        logger.error(e)
        return JsonResponse({"message": e}, status=500)


@csrf_exempt
@jwt_exempt
def handle_room_messages(request, uuid):
    user = verify_user(request)
    return JsonResponse({ "uuid": "room-12345", "name": "General Chat", "messages": [ { "sender": "Alice", "text": "Hello, everyone!", "timestamp": "2024-08-31T12:34:56Z" }, { "sender": "Bob", "text": "Hi Alice!", "timestamp": "2024-08-31T12:35:10Z" } ] }, status=200)
    if request.method == "GET":
        return handle_get_room_messages(request, user)
    elif request.method == "POST":
        return handle_post_room_message(request, user)
    else:
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"},
            status=400,
        )
