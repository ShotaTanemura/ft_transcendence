from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import AnonymousUser
from pong.middleware.auth import jwt_exempt
from pong.models.user import User
from django.db.models import Q
from .models import GameRecord
import shortuuid
from logging import getLogger

logger = getLogger(__name__)

@csrf_exempt
def get_user_match_result(request, name):
    if request.method != "GET":
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"}, status=400
        )

    user = User.objects.filter(name=name).first()

    if not user:
        return JsonResponse(
            {"message": "User not found", "status": "userNotFound"}, status=404
        )

    user_last_10_match_results = GameRecord.objects.filter(
        Q(user=user)
    ).order_by("-timestamp")[:10]

    logger.info(user_last_10_match_results)
    user_match_results = []

    for index, user_match_result in enumerate(user_last_10_match_results):
        user_match_result_json = {
            "id": index + 1,
            "contents": {
                "date": user_match_result.timestamp.strftime("%m/%d/%Y"),
                "player1": user_match_result.user.name,
                "player2": user_match_result.opponent.name,
                "winner": user_match_result.winner.name,
            },
        }
        user_match_results.append(user_match_result_json)
    
    user_match_results_json = {"match-results": user_match_results}
    
    return JsonResponse(
        user_match_results_json,
        status=200,
    )
