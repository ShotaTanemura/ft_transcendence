import json
from django.http.response import JsonResponse
from pong.models.user import UserManager
from pong.models.user import User
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
import jwt
from django.conf import settings
from django.http.response import HttpResponse
from pong.middleware.auth import jwt_exempt
from logging import getLogger


logger = getLogger(__name__)


@jwt_exempt
@csrf_exempt
def health(request):
    return JsonResponse({"message": "health check"})
