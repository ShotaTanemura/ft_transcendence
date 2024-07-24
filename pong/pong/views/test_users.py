from django.test import TestCase
from django.urls import reverse
from pong.models import User
import jwt
from django.conf import settings
from datetime import datetime


class GetUserTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            name="ユーザー名", email="example@email.com", password="p4s$W0rd"
        )
        self.token_payload = {
            "uuid": str(self.user.uuid),
            "exp": datetime.utcnow() + settings.JWT_AUTH["JWT_EXPIRATION_DELTA"],
            "iat": datetime.utcnow(),
        }
        self.token = jwt.encode(
            self.token_payload,
            settings.JWT_AUTH["JWT_PRIVATE_KEY"],
            algorithm=settings.JWT_AUTH["JWT_ALGORITHM"],
        )
        self.refresh_token_payload = {
            "uuid": str(self.user.uuid),
            "exp": datetime.utcnow()
            + settings.JWT_AUTH["JWT_REFRESH_EXPIRATION_DELTA"],
            "iat": datetime.utcnow(),
        }
        self.refresh_token = jwt.encode(
            self.refresh_token_payload,
            settings.JWT_AUTH["JWT_PRIVATE_KEY"],
            algorithm=settings.JWT_AUTH["JWT_ALGORITHM"],
        )
        self.client.cookies["token"] = self.token
        self.client.cookies["refresh_token"] = self.refresh_token

    def test_get_user_normal(self):
        response = self.client.get(
            reverse("pong:get_user", kwargs={"uuid": self.user.uuid}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)

    def test_get_user_not_allowed_method(self):
        response = self.client.post(
            reverse("pong:get_user", kwargs={"uuid": self.user.uuid}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_user_not_found(self):
        response = self.client.get(
            reverse(
                "pong:get_user", kwargs={"uuid": "b4cf1ef4-1cab-490b-a32c-f6528f95c796"}
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)
