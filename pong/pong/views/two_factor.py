from pong.utils.random_string import generate_base32_encoded_random_string
import urllib
import hmac
import hashlib
import time
import struct
import json
import base64


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

    user = User.objects.filter(uuid=uuid).first()
    if not user:
        return JsonResponse(
            {"message": "User not found", "status": "userNotFound"}, status=404
        )

    tfa = Users2FA.objects.filter(user=uuid).first()
    tfa.secret = generate_base32_encoded_random_string()
    tfa.save()

    # Generate
    uri = generateOtpUri(
        secret=tfa.secret,
        account_name=user.email,
        issuer=settings.DJANGO_2FA_ISSUER,
    )

    return JsonResponse({"uri": uri}, status=200)
