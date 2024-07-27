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


@jwt_exempt
@csrf_exempt
def create_chat_room(request):
    if request.method != "POST":
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"}, status=400
        )

    data = json.loads(request.body)

    if "name" not in data:
        return JsonResponse(
            {"message": "Invalid parameters", "status": "invalidParams"}, status=400
        )

    room = Rooms.RoomsManager.create_room(name=data["name"], password=data["password"])
    room_status = RoomStatus.RoomStatusManager.create_room_status(status="open")

    return JsonResponse(
        {
            "message": "Room created successfully",
            "room": room.name,
            "status": room_status.status,
        }
    )


@jwt_exempt
@csrf_exempt
def get_chat_rooms(request):
    rooms = Rooms.RoomsManager.get_rooms()

    return JsonResponse({"rooms": rooms})
