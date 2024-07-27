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


logger = getLogger(__name__)


@jwt_exempt
@csrf_exempt
def test(request):
    try:
        user = verify_user(request)
        logger.info(f"user_id: {user}")
        return JsonResponse({"message": "Hello, Chat!"})
    except Exception as e:
        logger.error(e)
        return JsonResponse({"message": e}, status=401)
