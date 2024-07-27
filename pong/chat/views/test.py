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
def test(request):
    return JsonResponse({"message": "Hello, Chat!"})
