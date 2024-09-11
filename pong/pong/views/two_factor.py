from django.http.response import JsonResponse
from pong.middleware.auth import getJwtPayloadCookie
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from pong.models import Users2FA
from pong.utils.random_string import generate_base32_encoded_raondom_string
import urllib


@csrf_exempt
def provisioning(request):
    if request.method != "POST":
        return JsonResponse(
            {"message": "Method is not allowed", "status": "invalidParams"}, status=400
        )

    payload = getJwtPayloadCookie(request)
    uuid = payload.get("uuid", None)
    if not payload or not uuid:
        return JsonResponse(
            {"message": "unauthorized", "status": "unauthorized"}, status=401
        )

    tfa = Users2FA.objects.filter(user=uuid).first()
    if tfa.is_active == True:
        tfa.secret = generate_base32_encoded_raondom_string()
    else:
        tfa.is_active = True
    tfa.save()

    # Generate
    uri = generateOtpUri(
        secret=tfa.secret,
        account_name=settings.DJANGO_2FA_ACCOUNT_NAME,
        issuer=settings.DJANGO_2FA_ISSUER,
    )

    return JsonResponse({"uri": uri}, status=200)


def generateOtpUri(
    secret, account_name, issuer, digits=6, period=30, algorithm="SHA256"
):
    query_params = {
        "secret": secret,
        "issuer": issuer,
        "digits": digits,
        "period": period,
        "algorithm": algorithm,
    }

    uri = f"otpauth://totp/{urllib.parse.quote(issuer)}:{urllib.parse.quote(account_name)}?{urllib.parse.urlencode(query_params)}"

    return uri
