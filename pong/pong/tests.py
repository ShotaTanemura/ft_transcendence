from django.test import TestCase
from django.urls import reverse
from .models import User

class UserViewsTest(TestCase):
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