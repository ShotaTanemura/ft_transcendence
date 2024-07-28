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
from chat.models import Rooms, UserRooms

logger = getLogger(__name__)


from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db import IntegrityError


@jwt_exempt
@csrf_exempt
def user_room(request):
    logger.info("user_room")
    try:
        user = verify_user(request)
        if request.method != "POST":
            return JsonResponse(
                {"message": "Method is not allowed", "status": "invalidParams"},
                status=400,
            )

        data = json.loads(request.body)
        logger.info(data)
        password = data.get("password")
        room_id = data.get("room_id")

        if not password or not room_id:
            return JsonResponse(
                {"message": "passwordとroom_idは必須です", "status": "invalidParams"},
                status=400,
            )

        try:
            room = Rooms.objects.get(uuid=room_id)
        except Rooms.DoesNotExist:
            logger.error("部屋が見つかりません")
            return JsonResponse(
                {"message": "部屋が見つかりません", "status": "invalidParams"},
                status=404,
            )

        user_room = UserRooms(user_id=user, room_id=room)
        user_room.save()

        return JsonResponse(
            {"message": "success", "status": "OK", "rooms": "ok"},
            status=200,
        )

    except IntegrityError as e:
        logger.error(e)
        return JsonResponse(
            {"message": "データベースエラーが発生しました", "status": "error"},
            status=500,
        )
    except AppError as e:
        logger.error(e)
        return JsonResponse(e.to_dict(), status=e.status_code)
    except Exception as e:
        logger.error(e)
        return JsonResponse({"message": str(e)}, status=500)
