from django.http.response import JsonResponse
from django.conf import settings
import jwt
from pong.models import User
from datetime import datetime, timedelta
from functools import wraps


def jwt_exempt(view_func):
	@wraps(view_func)
	def _wrapped_view_func(request, *args, **kwargs):
		return view_func(request, *args, **kwargs)
	_wrapped_view_func.jwt_exempt = True
	return _wrapped_view_func


class JWTAuthenticationMiddleware:

	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		return self.get_response(request)

	def process_view(self, request, view_func, view_args, view_kwargs):
		if getattr(view_func, 'jwt_exempt', False):
			return None

		token = request.COOKIES.get('token')
		if not token:
			return JsonResponse({
				'message': 'Forbidden',
				'status': 'Forbidden'
			}, status=403)

		try:
			payload = jwt.decode(token, settings.JWT_AUTH['JWT_PUBLIC_KEY'], algorithms=[settings.JWT_AUTH['JWT_ALGORITHM']])
		except jwt.ExpiredSignatureError:
			return JsonResponse({
				'message': 'Forbidden',
				'status': 'Forbidden'
			}, status=403)
		except jwt.InvalidTokenError:
			return JsonResponse({
				'message': 'Forbidden',
				'status': 'Forbidden'
			}, status=403)

		user = User.objects.filter(uuid=payload['uuid']).first()
		if not user:
			return JsonResponse({
				'message': 'Forbidden',
				'status': 'Forbidden'
			}, status=403)

		return None
