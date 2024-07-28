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
from chat.models import Rooms

logger = getLogger(__name__)

def serialize_rooms(room):
    return {"uuid": str(room.uuid), "name": room.name}

@jwt_exempt
@csrf_exempt
def search_rooms(request):
    try:
        user = verify_user(request)
        if request.method != "GET":
            return JsonResponse(
                {"message": "Method is not allowed", "status": "invalidParams"},
                status=400,
            )
        query = request.GET.get('query', '') 
        logger.info("search_rooms")
        
        # if query:
        #     rooms = Rooms.objects.filter(name__icontains=query)
        # else:
        #     rooms = Rooms.objects.all()
        rooms = Rooms.objects.all()
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
        return JsonResponse({"message": e}, status=500)

def rooms(request):
    try:
        user = verify_user(request)
        if request.method != "GET":
            return JsonResponse(
                {"message": "Method is not allowed", "status": "invalidParams"},
                status=400,
            )
        query = request.GET.get('query', '') 
        logger.info("search_rooms")
        
        # if query:
        #     rooms = Rooms.objects.filter(name__icontains=query)
        # else:
        #     rooms = Rooms.objects.all()
        rooms = Rooms.objects.all()
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
        return JsonResponse({"message": e}, status=500)
