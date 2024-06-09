from django.urls import path
from . import views

app_name = 'pong'
urlpatterns = [
    path('api/v1/auth/register', views.register, name='register'),
    path('api/v1/auth/token', views.create_token, name='token'),
    path('api/v1/auth/token/refresh', views.refresh_token, name='refresh'),
]
