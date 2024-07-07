import json
from django.http.response import JsonResponse
from pong.models import UserManager
from pong.models import User
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
from django.conf import settings
from django.http.response import HttpResponse
<<<<<<< HEAD
from pong.middleware.auth import jwt_exempt, getUserByJwt
import os
=======
from pong.middleware.auth import jwt_exempt, getUserByJwtCookie
from pong.utils.create_response import create_token_response
import requests
import jwt
import base64
import os

>>>>>>> develop

@jwt_exempt
@csrf_exempt
def test(request):
	return JsonResponse({
		'message': 'Hello, world!'
	})

@jwt_exempt
@csrf_exempt
def register(request):
	if request.method != 'POST':
		return JsonResponse({
			'message': 'Method is not allowed',
			'status': 'invalidParams'
		}, status=400)

	name = request.POST.get('name')
	email = request.POST.get('email')
	password = request.POST.get('password')
	icon = request.FILES.get('icon', None)

	if not all([name, email, password]):
		return JsonResponse({
			'message': 'Invalid parameters',
			'status': 'invalidParams'
		}, status=400)

	if User.objects.filter(name=name).exists() or User.objects.filter(email=email).exists():
		return JsonResponse({
			'message': 'User already exists',
			'status': 'registerConflict'
		}, status=409)

	user = User.objects.create_user(name=name, email=email, password=password, icon=icon)

	return JsonResponse({
		'uuid': str(user.uuid)
	}, status=201)

@jwt_exempt
@csrf_exempt
def create_token(request):
	if request.method != 'POST':
		return JsonResponse({
			'message': 'Method is not allowed',
			'status': 'invalidParams'
		}, status=400)

	data = json.loads(request.body)

	if 'email' not in data or 'password' not in data:
		return JsonResponse({
			'message': 'Invalid parameters',
			'status': 'invalidParams'
		}, status=400)

	user = User.objects.filter(email=data['email']).first()

	if not user or not user.check_password(data['password']):
		return JsonResponse({
			'message': 'User not found',
			'status': 'userNotFound'
		}, status=404)
<<<<<<< HEAD

	return create_token_response(user.uuid)
=======
	
	return create_token_response(user.uuid, JsonResponse({'uuid': user.uuid}, content_type='application/json'))
>>>>>>> develop

@jwt_exempt
@csrf_exempt
def refresh_token(request):
	if request.method != 'POST':
		return JsonResponse({
			'message': 'Method is not allowed',
			'status': 'invalidParams'
		}, status=400)

	refresh_token = request.COOKIES.get('refresh_token')
	if not refresh_token:
		return JsonResponse({
			'message': 'Refresh token not provided',
			'status': 'invalidParams'
		}, status=400)

	try:
		refresh_payload = jwt.decode(refresh_token, settings.JWT_AUTH['JWT_PUBLIC_KEY'], algorithms=[settings.JWT_AUTH['JWT_ALGORITHM']])
	except jwt.ExpiredSignatureError:
		return JsonResponse({
			'message': 'Refresh token has expired',
			'status': 'invalidParams'
		}, status=400)
	except jwt.InvalidTokenError:
		return JsonResponse({
			'message': 'Invalid refresh token',
			'status': 'invalidParams'
		}, status=400)

	user = User.objects.filter(uuid=refresh_payload['uuid']).first()
	if not user:
		return JsonResponse({
			'message': 'User not found',
			'status': 'userNotFound'
		}, status=404)

	return create_token_response(user.uuid, JsonResponse({'uuid': user.uuid}, content_type='application/json'))

@csrf_exempt
def verify_token(request):
	if request.method != 'POST':
		return JsonResponse({
			'message': 'Method is not allowed',
			'status': 'invalidParams'
		}, status=400)

	user = getUserByJwtCookie(request)
	if not user:
		return JsonResponse({
			'message': 'unauthorized',
			'status': 'unauthorized'
		}, status=401)

	return JsonResponse({
		'uuid': str(user.uuid)
	}, status=200)
