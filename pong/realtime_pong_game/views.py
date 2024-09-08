from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pong.middleware.auth import jwt_exempt
from pong.models import User
from django.db.models import Q
from .models import TournamentInfo, MatchInfo


@csrf_exempt
def get_user_match_result(request, uuid):
    if request.method != "GET":
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"}, status=400
        )

    user = User.objects.filter(uuid=uuid).first()

    if not user:
        return JsonResponse(
            {"message": "User not found", "status": "userNotFound"}, status=404
        )

    user_last_10_match_results = MatchInfo.objects.filter(
        Q(player1=user) | Q(player2=user)
    ).order_by("-created_at")[:10]

    user_match_results = []

    for index, user_match_result in enumerate(user_last_10_match_results):
        user_match_result_json = {
            "id": index + 1,
            "contents": {
                "player1": user_match_result.player1.name,
                "player2": user_match_result.player2.name,
                "player1_score": user_match_result.player1_score,
                "player2_score": user_match_result.player2_score,
            },
        }
        user_match_results.append(user_match_result_json)
    user_match_results_json = {"match-results": user_match_results}
    return JsonResponse(
        user_match_results_json,
        status=200,
    )
