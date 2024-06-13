from django.shortcuts import render
from pong.middleware.auth import jwt_exempt
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
@jwt_exempt
@csrf_exempt
def index(request):
    return render(request, "realtime/index.html")

@jwt_exempt
@csrf_exempt
def room(request, room_name):
    return render(request, "realtime/room.html", {"room_name": room_name})
