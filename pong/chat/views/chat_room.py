import json
from django.http.response import JsonResponse
from pong.models import UserManager
from pong.models import User
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
import jwt
from django.conf import settings
from django.http.response import HttpResponse
from pong.middleware.auth import jwt_exempt, getUserByJwt
from chat.views.auth import verify_user
from chat.utils.error import AppError, UnauthorizedError
from chat.models import Rooms
from logging import getLogger

logger = getLogger(__name__)


@jwt_exempt
@csrf_exempt
def create_chat_room(request):
    try:
        user = verify_user(request)
        data = json.loads(request.body)
        logger.info(data)
        try:
            Rooms.objects.create_room(
                data["name"], data["password"], data["status"], user
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
