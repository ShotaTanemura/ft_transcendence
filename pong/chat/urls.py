from django.urls import path
from .views import test

app_name = 'chat'
urlpatterns = [
    path('api/v1/test', test.test, name='test'),
]
