from django.urls import path
from . import views

urlpatterns = [
	path('', views.index, name='index'),
	path('pong/', views.pong, name='pong'),
	path('profile/', views.profile, name='profile')
]