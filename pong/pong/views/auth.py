import json
from django.http.response import JsonResponse
from pong.models import UserManager
from pong.models import User, ApiToken42
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
from django.conf import settings
from django.http.response import HttpResponse
from pong.middleware.auth import jwt_exempt, getUserByJwt
import requests
import jwt
import base64
import os

@jwt_exempt
@csrf_exempt
def test(request):
	return JsonResponse({
		'message': 'Hello, world!'
	})

def create_token_response(uuid):
	new_payload = {
		'uuid': str(uuid),
		'exp': datetime.utcnow() + settings.JWT_AUTH['JWT_EXPIRATION_DELTA'],
		'iat': datetime.utcnow()
	}
	new_token = jwt.encode(new_payload, settings.JWT_AUTH['JWT_PRIVATE_KEY'], algorithm=settings.JWT_AUTH['JWT_ALGORITHM'])

	new_refresh_payload = {
		'uuid': str(uuid),
		'exp': datetime.utcnow() + settings.JWT_AUTH['JWT_REFRESH_EXPIRATION_DELTA'],
		'iat': datetime.utcnow()
	}
	new_refresh_token = jwt.encode(new_refresh_payload, settings.JWT_AUTH['JWT_PRIVATE_KEY'], algorithm=settings.JWT_AUTH['JWT_ALGORITHM'])

	response = JsonResponse({'uuid': uuid}, content_type='application/json')
	# HTTPS実装後に有効化する
	# response.set_cookie('token', new_token, httponly=True, secure=True)
	# response.set_cookie('refresh_token', new_refresh_token, httponly=True, secure=True)
	response.set_cookie('token', new_token, httponly=True)
	response.set_cookie('refresh_token', new_refresh_token, httponly=True)

	return response

@jwt_exempt
@csrf_exempt
def register(request):

	if request.method != 'POST':
		return JsonResponse({
			'message': 'Method is not allowed',
			'status': 'invalidParams'
		}, status=400)

	data = json.loads(request.body)

	if 'name' not in data or 'email' not in data or 'password' not in data:
		return JsonResponse({
			'message': 'Invalid parameters',
			'status': 'invalidParams'
		}, status=400)

	if User.objects.filter(name=data['name']).exists() or User.objects.filter(email=data['email']).exists():
		return JsonResponse({
			'message': 'User already exists',
			'status': 'registerConflict'
		}, status=409)

	user = User.objects.create_user(name=data['name'], email=data['email'], password=data['password'])

	return JsonResponse({
		'uuid': user.uuid
	}, status=201)

@jwt_exempt
@csrf_exempt
def callback_42(request):
	if request.method != 'GET':
		return JsonResponse({
			'message': 'Method is not allowed',
			'status': 'invalidParams'
		}, status=400)
	code = request.GET.get('code', None)
	if not code:
		return JsonResponse({
			'message': 'Invalid parameters',
			'status': 'invalidParams'
		}, status=400)
	params = {
		'grant_type': 'authorization_code',
		'client_id': settings.CLIENT_ID_42API,
		'client_secret': settings.CLIENT_SECRET_42API,
		'code': code,
		'redirect_uri': 'http://localhost:8000/pong/api/v1/auth/callback/42',
	}
	response_token = requests.post('https://api.intra.42.fr/oauth/token', params=params)
	if response_token.status_code != 200:
		return JsonResponse({
			'message': 'Invalid code',
			'status': 'invalidParams'
		}, status=400)
	access_token = response_token.json()['access_token']
	headers = {
		'Authorization': 'Bearer ' + access_token,
	}
	response_user_info = requests.get('https://api.intra.42.fr/v2/me', headers=headers)
	if response_user_info.status_code != 200:
			return JsonResponse({
				'message': 'Invalid access token',
				'status': 'invalidParams'
			}, status=400)
	data_user_info = response_user_info.json()
	login = data_user_info['login']
	email = data_user_info['email']
	random_password = base64.urlsafe_b64encode(os.urandom(16)).decode('utf-8')
	if User.objects.filter(name=login, email=email).first():
		return JsonResponse({
			'message': 'User already exists',
			'status': 'registerConflict'
		}, status=409)
	user = User.objects.create_user(name=login, email=email, password=random_password)
	ApiToken42.objects.create(user=user, token=access_token)
	return JsonResponse({
		'uuid': user.uuid
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
	
	return create_token_response(user.uuid)

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

	return create_token_response(user.uuid)

@csrf_exempt
def verify_token(request):
	if request.method != 'POST':
		return JsonResponse({
			'message': 'Method is not allowed',
			'status': 'invalidParams'
		}, status=400)

	user = getUserByJwt(request)
	if not user:
		return JsonResponse({
			'message': 'unauthorized',
			'status': 'unauthorized'
		}, status=401)

	return JsonResponse({
		'uuid': str(user.uuid)
	}, status=200)
