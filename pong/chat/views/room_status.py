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
from logging import getLogger
from chat.utils.error import AppError, UnauthorizedError
from chat.models import RoomStatus

logger = getLogger(__name__)

def serialize_room_status(room_status):
    return {
        "id": room_status.id,
        "status": room_status.status
    }

@jwt_exempt
@csrf_exempt
def room_status(request):
    try:
        user = verify_user(request)
        if request.method != "GET":
            return JsonResponse(
                {"message": "Method is not allowed", "status": "invalidParams"}, status=400
            )
        logger.info("create_chat_room")

        status = RoomStatus.objects.all()
        serialized_status = [serialize_room_status(s) for s in status]
        logger.info(serialized_status)

        return JsonResponse(
            {"message": "success", "status": "OK", "room_statuses": serialized_status}, 
            status=200
        )
    
    except AppError as e:
        logger.error(e)
        return JsonResponse(e.to_dict(), status=e.status_code)
    except Exception as e:
        logger.error(e)
        return JsonResponse({"message": e}, status=500)
