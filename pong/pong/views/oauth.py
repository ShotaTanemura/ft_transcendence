from django.views.decorators.csrf import csrf_exempt
from django.http.response import JsonResponse, HttpResponseRedirect
from django.conf import settings
from django.urls import reverse
from pong.middleware.auth import jwt_exempt
from pong.models import User
from pong.utils.create_response import create_token_response
from datetime import datetime, timedelta
from urllib.parse import urlencode, quote, unquote
import requests
import base64
import json
import jwt
import os

def redirect_to_oauth(action):
    base_url = 'https://api.intra.42.fr/oauth/authorize'
    state = quote(json.dumps({'action': action}))
    params = {
        'client_id': settings.CLIENT_ID_42API,
        'redirect_uri': settings.OAUTH_CALLBACK_42API,
        'response_type': 'code',
		'state': state,
    }
    query_string = urlencode(params)
    url = f"{base_url}?{query_string}"
    
    return HttpResponseRedirect(url)

@jwt_exempt
@csrf_exempt
def oauth_42_signup(request):
	if request.method != 'GET':
		return JsonResponse({
			'message': 'Method is not allowed',
			'status': 'invalidParams'
		}, status=400)
	return redirect_to_oauth(action='signup')

@jwt_exempt
@csrf_exempt
def oauth_42_signin(request):
	if request.method != 'GET':
		return JsonResponse({
			'message': 'Method is not allowed',
			'status': 'invalidParams'
		}, status=400)
	return redirect_to_oauth(action='signin')

@jwt_exempt
@csrf_exempt
def callback_42(request):
	state = request.GET.get('state')
	if not state:
		return HttpResponseRedirect(redirect_to='/#invalidParameters')
		
	state_data = json.loads(unquote(state))
	action = state_data.get('action', None)
		
	if action not in ['signup', 'signin']:
		return HttpResponseRedirect(redirect_to='/#invalidParameters')
		
	path = 'signup' if action == 'signup' else ''
		
	if request.method != 'GET':
		return HttpResponseRedirect(redirect_to=f'/{path}#methodNotAllowed')
		
	code = request.GET.get('code')
	if not code:
		return HttpResponseRedirect(redirect_to=f'/{path}#failedToGetCode')
		
	params = {
		'grant_type': 'authorization_code',
		'client_id': settings.CLIENT_ID_42API,
		'client_secret': settings.CLIENT_SECRET_42API,
		'code': code,
		'redirect_uri': settings.OAUTH_CALLBACK_42API,
	}
		
	response_token = requests.post('https://api.intra.42.fr/oauth/token', data=params)
	if response_token.status_code != 200:
		return HttpResponseRedirect(redirect_to=f'/{path}#failedToGetToken')
		
	access_token = response_token.json().get('access_token')
	headers = {
		'Authorization': f'Bearer {access_token}',
	}
		
	response_user_info = requests.get('https://api.intra.42.fr/v2/me', headers=headers)
	if response_user_info.status_code != 200:
		return HttpResponseRedirect(redirect_to=f'/{path}#failedToGetUserInfo')
		
	data_user_info = response_user_info.json()
	login = data_user_info.get('login', None)
	email = data_user_info.get('email', None)
	if (not login) or (not email):
		return HttpResponseRedirect(redirect_to=f'/{path}#failedToGetUserInfo')		
		
	if action == 'signup':
		random_password = base64.urlsafe_b64encode(os.urandom(16)).decode('utf-8')
		if User.objects.filter(name=login, email=email).exists():
			return HttpResponseRedirect(redirect_to=f'/{path}#userAlreadyExists')
		user = User.objects.create_user(name=login, email=email, password=random_password)
	else:  # action == 'signin'
		user = User.objects.filter(name=login, email=email).first()
		if not user:
			return HttpResponseRedirect(redirect_to='/#userDoesNotExist')
		
	return create_token_response(user.uuid, HttpResponseRedirect(redirect_to='/home'))
