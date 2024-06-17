from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pong.middleware.auth import jwt_exempt

@jwt_exempt
@csrf_exempt
def echo(request):
	return JsonResponse({
		'message': 'Hello, world!'
	})
