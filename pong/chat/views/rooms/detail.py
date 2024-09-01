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
from chat.models import Rooms, Messages

logger = getLogger(__name__)


def handle_post_message(request, user, room_id):
    try:
        data = json.loads(request.body)
        logger.info(data)
        try:
            Messages.objects.create_message(
                user['user_id'], room_id, data["message"]
            )
            
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
def handle_detail(request, room_id):
    user = verify_user(request)
    if request.method == "GET":
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"},
            status=400,
        )
    
    elif request.method == "POST":
        return handle_post_message(request, user, room_id)
    else:
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"},
            status=400,
        )
