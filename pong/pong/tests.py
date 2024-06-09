from django.test import TestCase
from django.urls import reverse
from .models import User
import jwt
from django.conf import settings
from http.cookies import SimpleCookie
from datetime import datetime, timedelta

class UserRegisterTest(TestCase):
	def test_register_normal(self):
		data = {
			'name': 'ユーザー名',
			'email': 'example@email.com',
			'password': 'p4s$W0rd'
		}
		response = self.client.post(reverse('pong:register'), data=data, content_type='application/json')
		user = User.objects.filter(name=data['name']).first()
		self.assertEqual(response.json()['uuid'], str(user.uuid))
		self.assertTrue(user.check_password(data['password']))
		self.assertEqual(response.status_code, 201)

	def test_register_not_allowed_method(self):
		response = self.client.get(reverse('pong:register'))
		self.assertEqual(response.json()['message'], 'Method is not allowed')
		self.assertEqual(response.json()['status'], 'invalidParams')
		self.assertEqual(response.status_code, 400)

	def test_register_no_name(self):
		data = {
			'email': 'example@email.com',
			'password': 'p4s$W0rd'
		}
		response = self.client.post(reverse('pong:register'), data=data, content_type='application/json')
		self.assertEqual(response.json()['message'], 'Invalid parameters')
		self.assertEqual(response.json()['status'], 'invalidParams')
		self.assertEqual(response.status_code, 400)

	def test_register_no_email(self):
		data = {
			'name': 'ユーザー名',
			'password': 'p4s$W0rd'
		}
		response = self.client.post(reverse('pong:register'), data=data, content_type='application/json')
		self.assertEqual(response.json()['message'], 'Invalid parameters')
		self.assertEqual(response.json()['status'], 'invalidParams')
		self.assertEqual(response.status_code, 400)

	def test_register_no_password(self):
		data = {
			'name': 'ユーザー名',
			'email': 'example@email.com',
		}
		response = self.client.post(reverse('pong:register'), data=data, content_type='application/json')
		self.assertEqual(response.json()['message'], 'Invalid parameters')
		self.assertEqual(response.json()['status'], 'invalidParams')
		self.assertEqual(response.status_code, 400)

	def test_register_user_already_exists(self):
		User.objects.create_user(name='ユーザー名', email='example@email1.com', password='p4s$W0rd')
		data = {
			'name': 'ユーザー名',
			'email': 'example2@email.com',
			'password': 'p4s$W0rd'
		}
		response = self.client.post(reverse('pong:register'), data=data, content_type='application/json')
		self.assertEqual(response.json()['message'], 'User already exists')
		self.assertEqual(response.json()['status'], 'registerConflict')
		self.assertEqual(response.status_code, 409)

	def test_register_email_already_exists(self):
		User.objects.create_user(name='ユーザー名1', email='example@email.com', password='p4s$W0rd')
		data = {
			'name': 'ユーザー名2',
			'email': 'example@email.com',
			'password': 'p4s$W0rd'
		}
		response = self.client.post(reverse('pong:register'), data=data, content_type='application/json')
		self.assertEqual(response.json()['message'], 'User already exists')
		self.assertEqual(response.json()['status'], 'registerConflict')
		self.assertEqual(response.status_code, 409)

class UserTokenTest(TestCase):
	def test_token_normal(self):
		user = User.objects.create_user(name='ユーザー名', email='example@email.com', password='p4s$W0rd')
		data = {
			"email": "example@email.com",
			"password": "p4s$W0rd"
		}
		response = self.client.post(reverse('pong:token'), data=data, content_type='application/json')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()['uuid'], str(user.uuid))

		token = response.client.cookies['token'].value
		try:
			decoded_token = jwt.decode(token, settings.JWT_AUTH['JWT_PUBLIC_KEY'], algorithms=['RS256'])
		except jwt.ExpiredSignatureError:
			self.fail('Token is expired')
		except jwt.InvalidTokenError:
			self.fail('Token is invalid')
		self.assertIn('uuid', decoded_token)
		self.assertIn('exp', decoded_token)
		self.assertIn('iat', decoded_token)
		self.assertEqual(decoded_token['uuid'], str(user.uuid))

		refresh_token = response.client.cookies['refresh_token'].value
		try:
			decoded_refresh_token = jwt.decode(refresh_token, settings.JWT_AUTH['JWT_PUBLIC_KEY'], algorithms=['RS256'])
		except jwt.ExpiredSignatureError:
			self.fail('Refresh token is expired')
		except jwt.InvalidTokenError:
			self.fail('Refresh token is invalid')
		self.assertIn('uuid', decoded_refresh_token)
		self.assertIn('exp', decoded_refresh_token)
		self.assertIn('iat', decoded_refresh_token)
		self.assertEqual(decoded_refresh_token['uuid'], str(user.uuid))

	def test_token_no_email(self):
		data = {
			"password": "p4s$W0rd"
		}
		response = self.client.post(reverse('pong:token'), data=data, content_type='application/json')
		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.json()['message'], 'Invalid parameters')
		self.assertEqual(response.json()['status'], 'invalidParams')
	
	def test_token_no_password(self):
		data = {
			"email": "example@email.com",
		}
		response = self.client.post(reverse('pong:token'), data=data, content_type='application/json')
		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.json()['message'], 'Invalid parameters')
		self.assertEqual(response.json()['status'], 'invalidParams')
	
	def test_token_user_not_found(self):
		data = {
			"email": "example@email.com",
			"password": "p4s$W0rd"
		}
		response = self.client.post(reverse('pong:token'), data=data, content_type='application/json')
		self.assertEqual(response.status_code, 404)
		self.assertEqual(response.json()['message'], 'User not found')
		self.assertEqual(response.json()['status'], 'userNotFound')

class UserRefreshTokenTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(name='ユーザー名', email='example@email.com', password='p4s$W0rd')
        self.refresh_token_payload = {
            'uuid': str(self.user.uuid),
            'exp': datetime.utcnow() + settings.JWT_AUTH['JWT_REFRESH_EXPIRATION_DELTA'],
            'iat': datetime.utcnow()
        }
        self.refresh_token = jwt.encode(self.refresh_token_payload, settings.JWT_AUTH['JWT_PRIVATE_KEY'], algorithm=settings.JWT_AUTH['JWT_ALGORITHM'])

    def test_refresh_token_normal(self):
        self.client.cookies['refresh_token'] = self.refresh_token
        response = self.client.post(reverse('pong:refresh'), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['uuid'], str(self.user.uuid))

        token = response.client.cookies['token'].value
        try:
            decoded_token = jwt.decode(token, settings.JWT_AUTH['JWT_PUBLIC_KEY'], algorithms=['RS256'])
        except jwt.ExpiredSignatureError:
            self.fail('Token is expired')
        except jwt.InvalidTokenError:
            self.fail('Token is invalid')
        self.assertIn('uuid', decoded_token)
        self.assertIn('exp', decoded_token)
        self.assertIn('iat', decoded_token)
        self.assertEqual(decoded_token['uuid'], str(self.user.uuid))

        new_refresh_token = response.client.cookies['refresh_token'].value
        try:
            decoded_refresh_token = jwt.decode(new_refresh_token, settings.JWT_AUTH['JWT_PUBLIC_KEY'], algorithms=['RS256'])
        except jwt.ExpiredSignatureError:
            self.fail('Refresh token is expired')
        except jwt.InvalidTokenError:
            self.fail('Refresh token is invalid')
        self.assertIn('uuid', decoded_refresh_token)
        self.assertIn('exp', decoded_refresh_token)
        self.assertIn('iat', decoded_refresh_token)
        self.assertEqual(decoded_refresh_token['uuid'], str(self.user.uuid))

    def test_refresh_token_expired(self):
        expired_refresh_token_payload = {
            'uuid': str(self.user.uuid),
            'exp': datetime.utcnow() - timedelta(seconds=1),
            'iat': datetime.utcnow() - timedelta(days=30)
        }
        expired_refresh_token = jwt.encode(expired_refresh_token_payload, settings.JWT_AUTH['JWT_PRIVATE_KEY'], algorithm=settings.JWT_AUTH['JWT_ALGORITHM'])
        self.client.cookies['refresh_token'] = expired_refresh_token
        response = self.client.post(reverse('pong:refresh'), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['message'], 'Refresh token has expired')
        self.assertEqual(response.json()['status'], 'invalidParams')

    def test_refresh_token_invalid(self):
        self.client.cookies['refresh_token'] = 'invalid_token'
        response = self.client.post(reverse('pong:refresh'), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['message'], 'Invalid refresh token')
        self.assertEqual(response.json()['status'], 'invalidParams')
