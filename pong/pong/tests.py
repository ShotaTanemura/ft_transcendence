from django.test import TestCase
from django.urls import reverse
from .models import User
import jwt
from django.conf import settings

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
	def extract_token_from_cookie(self, cookie):
		parts = cookie.split(';')
		for part in parts:
			if 'token' in part:
				return part.split('=')[1]
		return None

	def test_token_normal(self):
		user = User.objects.create_user(name='ユーザー名', email='example@email.com', password='p4s$W0rd')
		data = {
			"email": "example@email.com",
			"password": "p4s$W0rd"
		}
		response = self.client.post(reverse('pong:token'), data=data, content_type='application/json')
		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.json()['uuid'], str(user.uuid))
		self.assertIn(response.headers, 'Set-Cookie')
		
		cookie = response.headers['Set-Cookie']
		token = self.extract_token_from_cookie(cookie)
		try:
			decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['RS256'])
		except jwt.ExpiredSignatureError:
			self.fail('Token is expired')
		except jwt.InvalidTokenError:
			self.fail('Token is invalid')
		self.assertIn('uuid', decoded_token)
		self.assertIn('exp', decoded_token)
		self.assertIn('iat', decoded_token)
		self.assertEqual(decoded_token['uuid'], str(user.uuid))

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