from django.conf import settings
from datetime import datetime
import jwt


def create_token_response(uuid, response):
    new_payload = {
        "uuid": str(uuid),
        "exp": datetime.utcnow() + settings.JWT_AUTH["JWT_EXPIRATION_DELTA"],
        "iat": datetime.utcnow(),
    }
    new_token = jwt.encode(
        new_payload,
        settings.JWT_AUTH["JWT_PRIVATE_KEY"],
        algorithm=settings.JWT_AUTH["JWT_ALGORITHM"],
    )

    new_refresh_payload = {
        "uuid": str(uuid),
        "exp": datetime.utcnow() + settings.JWT_AUTH["JWT_REFRESH_EXPIRATION_DELTA"],
        "iat": datetime.utcnow(),
    }
    new_refresh_token = jwt.encode(
        new_refresh_payload,
        settings.JWT_AUTH["JWT_PRIVATE_KEY"],
        algorithm=settings.JWT_AUTH["JWT_ALGORITHM"],
    )

    # HTTPS実装後に有効化する
    # response.set_cookie('token', new_token, httponly=True, secure=True)
    # response.set_cookie('refresh_token', new_refresh_token, httponly=True, secure=True)
    response.set_cookie("token", new_token, httponly=True)
    response.set_cookie("refresh_token", new_refresh_token, httponly=True)

    return response


def create_session_token_response(uuid, response, exp_delta, status, auth_level):
    new_payload = {
        "uuid": str(uuid),
        "exp": datetime.utcnow() + exp_delta,
        "iat": datetime.utcnow(),
        "status": status,
        "auth_level": auth_level,
    }

    new_token = jwt.encode(
        new_payload,
        settings.JWT_AUTH["JWT_PRIVATE_KEY"],
        algorithm=settings.JWT_AUTH["JWT_ALGORITHM"],
    )

    response.set_cookie("session_token", new_token, httponly=True)

    return response
