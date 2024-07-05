from django.views.decorators.csrf import csrf_exempt
from django.http.response import JsonResponse, HttpResponseRedirect
from django.conf import settings
from django.urls import reverse
from pong.middleware.auth import jwt_exempt
from pong.models import User
from pong.utils.create_response import create_token_response
from datetime import datetime, timedelta
from urllib.parse import urlencode
import requests
import base64
import json
import jwt
import os

def redirect_to_oauth():
    base_url = 'https://api.intra.42.fr/oauth/authorize'
    params = {
        'client_id': settings.CLIENT_ID_42API,
        'redirect_uri': settings.OAUTH_CALLBACK_42API,
        'response_type': 'code',
    }
    query_string = urlencode(params)
    url = f"{base_url}?{query_string}"
    
    return HttpResponseRedirect(url)

@jwt_exempt
@csrf_exempt
def oauth_42(request):
	if request.method != 'GET':
		return JsonResponse({
			'message': 'Method is not allowed',
			'status': 'invalidParams'
		}, status=400)
	return redirect_to_oauth()

@jwt_exempt
@csrf_exempt
def callback_42(request):
	if request.method != 'GET':
		return HttpResponseRedirect(redirect_to='/signup#methodNotAllowed')
	code = request.GET.get('code', None)
	if not code:
		return HttpResponseRedirect(redirect_to='/signup#failedToGetCode')
	params = {
		'grant_type': 'authorization_code',
		'client_id': settings.CLIENT_ID_42API,
		'client_secret': settings.CLIENT_SECRET_42API,
		'code': code,
		'redirect_uri': 'http://localhost:8080/pong/oauth/callback/42',
	}
	response_token = requests.post('https://api.intra.42.fr/oauth/token', params=params)
	if response_token.status_code != 200:
		return HttpResponseRedirect(redirect_to='/signup#failedToGetToken')
	access_token = response_token.json()['access_token']
	headers = {
		'Authorization': 'Bearer ' + access_token,
	}
	response_user_info = requests.get('https://api.intra.42.fr/v2/me', headers=headers)
	if response_user_info.status_code != 200:
			return HttpResponseRedirect(redirect_to='/signup#failedToGetUserInfo')
	data_user_info = response_user_info.json()
	login = data_user_info['login']
	email = data_user_info['email']
	random_password = base64.urlsafe_b64encode(os.urandom(16)).decode('utf-8')
	if User.objects.filter(name=login, email=email).first():
		return HttpResponseRedirect(redirect_to='/signup#userAlreadyExists')
	user = User.objects.create_user(name=login, email=email, password=random_password)
	return create_token_response(user.uuid, HttpResponseRedirect(redirect_to='/home'))
