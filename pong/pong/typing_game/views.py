from django.shortcuts import render

def index(request):
    return render(request, "typing_game/index.html")