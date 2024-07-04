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

@csrf_exempt
def get_user(request, uuid):
	if request.method != 'GET':
		return JsonResponse({
			'message': 'Method is not allowed',
			'status': 'invalidParams'
		}, status=400)

	user = User.objects.filter(uuid=uuid).first()

	if not user:
		return JsonResponse({
			'message': 'User not found',
			'status': 'userNotFound'
		}, status=404)

	return JsonResponse({
		'uuid': user.uuid,
		'name': user.name,
		'email': user.email,
		'icon': user.icon.url
	}, status=200)
