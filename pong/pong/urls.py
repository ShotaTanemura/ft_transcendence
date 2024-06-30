from django.urls import path
from .views import auth
from .views import users
import uuid

app_name = 'pong'
urlpatterns = [
    path('api/v1/auth/register', auth.register, name='register'),
    path('api/v1/auth/token', auth.create_token, name='token'),
    path('api/v1/auth/token/refresh', auth.refresh_token, name='refresh'),
    path('api/v1/auth/token/verify', auth.verify_token, name='verify'),
    path('api/v1/users/<uuid:uuid>', users.get_user, name='get_user'),
]
