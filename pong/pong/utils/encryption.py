from cryptography.fernet import Fernet
from django.conf import settings
import base64
import os

def generate_key():
    key = base64.urlsafe_b64encode(settings.SECRET_KEY[:32].encode())
    return key

fernet = Fernet(generate_key())

def generate_salt():
    return base64.urlsafe_b64encode(os.urandom(16)).decode('utf-8')

def encrypt_data(data, salt):
    pepper = settings.PEPPER
    data_to_encrypt = salt + pepper + data
    encrypted_data = fernet.encrypt(data_to_encrypt.encode('utf-8'))
    return encrypted_data.decode('utf-8')

def decrypt_data(encrypted_data, salt):
    pepper = settings.PEPPER
    decrypted_data = fernet.decrypt(encrypted_data.encode('utf-8')).decode('utf-8')
    data_without_salt_and_pepper = decrypted_data[len(salt) + len(pepper):]
    return data_without_salt_and_pepper
