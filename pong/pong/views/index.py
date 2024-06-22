from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pong.middleware.auth import jwt_exempt
from django.shortcuts import render

@jwt_exempt
@csrf_exempt
def index(request):
	return render(request, 'pong/index.html')