import json
from django.http.response import JsonResponse
from .models import UserManager
from .models import User
from django.views.decorators.csrf import csrf_exempt

def test(request):
	return JsonResponse({
		'message': 'Hello, world!'
	})

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