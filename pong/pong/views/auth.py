import json
from django.http.response import JsonResponse
from pong.models import UserManager
from pong.models import User
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
import jwt
from django.conf import settings
from django.http.response import HttpResponse
from pong.middleware.auth import jwt_exempt

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
