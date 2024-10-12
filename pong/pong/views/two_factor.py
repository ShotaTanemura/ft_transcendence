from pong.utils.random_string import generate_base32_encoded_random_string
from pong.middleware.auth import getJwtPayloadCookie
from pong.models.user import User, Users2FA
from django.http.response import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
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


def generateOtpUri(secret, account_name, issuer, digits=6, period=30, algorithm="SHA1"):
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

    if not is_valid_totp_code(secret=tfa.secret, code=code):
        return JsonResponse(
            {"message": "OTP is invalid", "status": "invalidParams"}, status=400
        )

    tfa.is_active = True
    tfa.save()

    return JsonResponse(
        {"message": "OTP Authentication is succeeded", "status": "success"}, status=200
    )


def is_valid_totp_code(secret, code, window=1, digits=6, period=30, algorithm="SHA1"):
    def add_padding(secret):
        return secret + "=" * ((8 - len(secret) % 8) % 8)

    def generate_totp(secret, time_counter, digits=6, algorithm="SHA1"):
        padded_secret = add_padding(secret)
        key = base64.b32decode(padded_secret, casefold=True)
        time_counter_bytes = time_counter.to_bytes(8, "big")

        hmac_hash = hmac.new(
            key, time_counter_bytes, getattr(hashlib, algorithm.lower())
        ).digest()

        offset = hmac_hash[-1] & 0x0F
        truncated_hash = hmac_hash[offset : offset + 4]
        binary_code = int.from_bytes(truncated_hash, byteorder="big") & 0x7FFFFFFF

        otp = str(binary_code % (10**digits)).zfill(digits)
        return otp

    current_time = int(time.time())
    time_counter = current_time // period

    for error_window in range(-window, window + 1):
        calculated_code = generate_totp(
            secret, time_counter + error_window, digits, algorithm
        )
        if calculated_code == code:
            return True

    return False
