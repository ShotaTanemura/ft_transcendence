from django.http.response import JsonResponse
from pong.middleware.auth import getJwtPayloadCookie
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from pong.models import Users2FA
from pong.utils.random_string import generate_base32_encoded_raondom_string
import urllib
import hmac
import hashlib
import time
import struct


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
    tfa.secret = generate_base32_encoded_raondom_string()
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

@csrf_exempt
def register(request):
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

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError as e:
        logger.error("Invalid JSON: {e}")
        return JsonResponse(
            {"message": "Invalid JSON", "status": "invalidJson"}, status=400
        )
    
    code = data.get("code", None)
    if not code:
        return JsonResponse(
            {"message": "Invalid parameters", "status": "invalidParams"}, status=400
        )

    tfa = Users2FA.objects.filter(user=uuid).first()
    otp = generate_otp(tfa.secret)

    if code is not otp:
        return JsonResponse(
            {"message": "OTP is invalid", "status": "invalidParams"}, status=400
        )

    tfa.is_active = True
    tfa.save()

    return JsonResponse(
            {"message": "OTP Authentication is succeeded", "status": "success"}, status=200
        )


def generate_totp(secret, time_step=30, timestamp=None):
    if timestamp is None:
        timestamp = int(time.time())

    time_counter = timestamp // time_step

    time_counter_bytes = struct.pack(">Q", time_counter)
    
    hmac_hash = hmac.new(secret, time_counter_bytes, hashlib.SHA256).digest()
    
    offset = hmac_hash[-1] & 0x0F
    binary_code = struct.unpack(">I", hmac_hash[offset:offset+4])[0] & 0x7FFFFFFF
    
    otp = binary_code % 1000000
    return otp
