from django.test import TestCase
from django.urls import reverse
from django.conf import settings
from pong.models import User, Users2FA
from pong.views import two_factor
from datetime import datetime
import jwt

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

    def test_register_normal(self):
        response = self.client.post(reverse("pong:two_factor"))
        data = response.json()
        tfa = Users2FA.objects.filter(user=self.user.uuid).first()
        actual = two_factor.generateOtpUri(secret=tfa.secret, account_name=settings.DJANGO_2FA_ACCOUNT_NAME, issuer=settings.DJANGO_2FA_ISSUER)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["uri"], actual)
