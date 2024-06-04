from django.shortcuts import render

# # Create your views here.

# def index(request):
#     return render(request, "pong_app/index.html")

from django.shortcuts import render

def index(request):
    return render(request, 'pong_app/index.html')

def pong(request):
    return render(request, 'pong_app/pong.html')

def profile(request):
    return render(request, 'pong_app/profile.html')