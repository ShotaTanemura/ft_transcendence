from django.http.response import JsonResponse
from pong.models import User, UserIconUpdateForm
from django.views.decorators.csrf import csrf_exempt
from pong.middleware.auth import jwt_exempt

@csrf_exempt
def get_user(request, uuid):
    if request.method != "GET":
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"}, status=400
        )

    user = User.objects.filter(uuid=uuid).first()

    if not user:
        return JsonResponse(
            {"message": "User not found", "status": "userNotFound"}, status=404
        )

    return JsonResponse(
        {
            "uuid": user.uuid,
            "name": user.name,
            "email": user.email,
            "icon": user.icon.url,
        },
        status=200,
    )

@csrf_exempt
@jwt_exempt
def user_icon(request, uuid):
    if request.method != "POST":
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"}, status=400
        )

    icon = request.FILES.get("icon", None)

    if not icon:
        return JsonResponse({
            'message': 'Invalid parameters',
            'status': 'invalidParams'
        }, status=400)

    user = User.objects.filter(uuid=uuid).first()

    if not user:
        return JsonResponse(
            {"message": "User not found", "status": "userNotFound"}, status=404
        )

    form = UserIconUpdateForm(request.POST, request.FILES, instance=user)

    if not form.is_valid():
        return JsonResponse({
            'message': 'Invalid parameters',
            'status': 'invalidParams'
        }, status=400)
    
    form.save()

    return JsonResponse(
        {
            "uuid": user.uuid,
            "name": user.name,
            "email": user.email,
            "icon": user.icon.url,
        },
        status=200,
    )
