from django.db import IntegrityError
from django.contrib.auth.models import AnonymousUser
from django.views.decorators.csrf import csrf_exempt
from django.http.response import JsonResponse
from pong.models.friend import Friend, FriendRequest
from pong.models.user import User, UserIconUpdateForm
import json
import logging

logger = logging.getLogger(__name__)


@csrf_exempt
def send_friend_request(request):
    try:
        # return 401 if user is anonymous
        sender = request.user
        if sender == AnonymousUser:
            return JsonResponse(
                {"message": "unauthorized", "status": "unauthorized"}, status=401
            )
        # only post method is allowed
        if request.method != "POST":
            return JsonResponse(
                {"message": "Method is not allowed", "status": "invalidParams"},
                status=400,
            )
        # request should be json format.
        try:
            data = json.loads(request.body)
            reciever_name = data["requested-user-name"]
        except json.JSONDecodeError as e:
            logger.error("Invalid JSON: {e}")
            return JsonResponse(
                {"message": "Invalid JSON", "status": "invalidJson"}, status=400
            )
        # get reciever name from his name.
        reciever = User.objects.filter(name=reciever_name).first()
        if not reciever or reciever == request.user:
            return JsonResponse(
                {"message": "Users not found", "status": "userNotFound"}, status=404
            )
        # if reciever have already sent the request to sender, deny the request.
        reverse_request = FriendRequest.objects.filter(sender=reciever, reciever=sender)
        if reverse_request:
            return JsonResponse(
                {"message": "Already requested from reciever.", "status": "Conflict"},
                status=409,
            )
        # if they are already friend, deny the request.
        friend = Friend.objects.filter(user=sender, friend=reciever)
        if friend:
            return JsonResponse(
                {"message": "Already friend.", "status": "Conflict"}, status=409
            )
        try:
            FriendRequest.objects.create(sender=sender, reciever=reciever)
        except IntegrityError as e:
            logger.error("IntegrityError: {e}")
            return JsonResponse(
                {"message": "Already Requested.", "status": "IntegrityError"},
                status=409,
            )
        return JsonResponse(
            {"status": "ok"},
            status=200,
        )
    except Exception as e:
        logger.error(f"Server error: {e}")
        return JsonResponse(
            {"message": "Internal Server Error", "status": "serverError"}, status=500
        )


@csrf_exempt
def approve_friend_request(request):
    try:
        # return 401 if user is anonymous
        reciever = request.user
        if reciever == AnonymousUser:
            return JsonResponse(
                {"message": "unauthorized", "status": "unauthorized"}, status=401
            )
        # only post method is allowed
        if request.method != "POST":
            return JsonResponse(
                {"message": "Method is not allowed", "status": "invalidParams"},
                status=400,
            )
        # request should be json format.
        try:
            data = json.loads(request.body)
            sender_name = data["request-user-name"]
        except json.JSONDecodeError as e:
            logger.error("Invalid JSON: {e}")
            return JsonResponse(
                {"message": "Invalid JSON", "status": "invalidJson"}, status=400
            )
        # get sender name from his name.
        sender = User.objects.filter(name=sender_name).first()
        if not sender:
            return JsonResponse(
                {"message": "Users not found", "status": "userNotFound"}, status=404
            )
        friend_request = FriendRequest.objects.filter(sender=sender, reciever=reciever)
        if not friend_request:
            return JsonResponse(
                {"message": "RequestNotFound", "status": "NotFound"}, status=404
            )
        try:
            friend_request.delete()
            Friend.objects.create(user=sender, friend=reciever)
            Friend.objects.create(user=reciever, friend=sender)
        except IntegrityError as e:
            return JsonResponse(
                {"message": "AlreadyFriends", "status": "Conflict"}, status=409
            )
        return JsonResponse(
            {"status": "ok"},
            status=200,
        )
    except Exception as e:
        logger.error(f"Server error: {e}")
        return JsonResponse(
            {"message": "Internal Server Error", "status": "serverError"}, status=500
        )


@csrf_exempt
def get_friends(request):
    try:
        # return 401 if user is anonymous
        user = request.user
        if user == AnonymousUser:
            return JsonResponse(
                {"message": "unauthorized", "status": "unauthorized"}, status=401
            )
        # only post method is allowed
        if request.method != "GET":
            return JsonResponse(
                {"message": "Method is not allowed", "status": "invalidParams"},
                status=400,
            )
        friends = Friend.objects.filter(user=user)
        if not friends:
            friends = []
        hitted_friend_list = []
        for friend in friends:
            hitted_friend_list.append(
                {
                    "name": friend.friend.name,
                    "icon": friend.friend.icon.url if friend.friend.icon else None,
                }
            )
        return JsonResponse(
            {"friends": hitted_friend_list},
            status=200,
        )
    except Exception as e:
        logger.error(f"Server error: {e}")
        return JsonResponse(
            {"message": "Internal Server Error", "status": "serverError"}, status=500
        )


@csrf_exempt
def get_requested_friends(request):
    try:
        # return 401 if user is anonymous
        user = request.user
        if user == AnonymousUser:
            return JsonResponse(
                {"message": "unauthorized", "status": "unauthorized"}, status=401
            )
        # only post method is allowed
        if request.method != "GET":
            return JsonResponse(
                {"message": "Method is not allowed", "status": "invalidParams"},
                status=400,
            )
        friends = FriendRequest.objects.filter(reciever=user)
        if not friends:
            friends = []
        hitted_friend_list = []
        for friend in friends:
            hitted_friend_list.append(
                {
                    "name": friend.sender.name,
                    "icon": friend.sender.icon.url if friend.sender.icon else None,
                }
            )
        return JsonResponse(
            {"requested-friends": hitted_friend_list},
            status=200,
        )
    except Exception as e:
        logger.error(f"Server error: {e}")
        return JsonResponse(
            {"message": "Internal Server Error", "status": "serverError"}, status=500
        )


@csrf_exempt
def get_pending_friends(request):
    try:
        # return 401 if user is anonymous
        user = request.user
        if user == AnonymousUser:
            return JsonResponse(
                {"message": "unauthorized", "status": "unauthorized"}, status=401
            )
        # only post method is allowed
        if request.method != "GET":
            return JsonResponse(
                {"message": "Method is not allowed", "status": "invalidParams"},
                status=400,
            )
        friends = FriendRequest.objects.filter(sender=user)
        if not friends:
            friends = []
        hitted_friend_list = []
        for friend in friends:
            hitted_friend_list.append(
                {
                    "name": friend.reciever.name,
                    "icon": friend.reciever.icon.url if friend.reciever.icon else None,
                }
            )
        return JsonResponse(
            {"pending-friends": hitted_friend_list},
            status=200,
        )
    except Exception as e:
        logger.error(f"Server error: {e}")
        return JsonResponse(
            {"message": "Internal Server Error", "status": "serverError"}, status=500
        )
