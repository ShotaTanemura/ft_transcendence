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


def serialize_rooms(room):
    return {"uuid": str(room.uuid), "name": room.name}


def handle_get_rooms(request, user):
    try:
        query = request.GET.get("query", "")

        if query:
            # ユーザーが所属していないルームを検索
            rooms = Rooms.objects.filter(
                ~Q(userrooms__user_id_id=user.uuid) & Q(name__icontains=query)
            )
        else:
            # ユーザーが所属していないルームを取得
            rooms = Rooms.objects.filter(~Q(userrooms__user_id_id=user.uuid))

        response_rooms = [serialize_rooms(room) for room in rooms]

        logger.info(response_rooms)

        return JsonResponse(
            {"message": "success", "status": "OK", "rooms": response_rooms},
            status=200,
        )

    except AppError as e:
        logger.error(e)
        return JsonResponse(e.to_dict(), status=e.status_code)
    except Exception as e:
        logger.error(e)
        return JsonResponse({"message": str(e)}, status=500)


def handle_post_rooms(request, user):
    try:
        data = json.loads(request.body)
        logger.info(data)
        try:
            Rooms.objects.create_room(data["name"], user)
        except ValueError as e:
            return JsonResponse({"message": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)

        return JsonResponse(
            {"message": "created chat room", "status": "Created"}, status=200
        )

    except AppError as e:
        logger.error(e)
        return JsonResponse(e.to_dict(), status=e.status_code)
    except Exception as e:
        logger.error(e)
        return JsonResponse({"message": e}, status=500)


@csrf_exempt
@jwt_exempt
def handle_unjoined_rooms(request):
    user = verify_user(request)

    if request.method == "GET":
        return handle_get_rooms(request, user)
    elif request.method == "POST":
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"},
            status=400,
        )
    else:
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"},
            status=400,
        )
