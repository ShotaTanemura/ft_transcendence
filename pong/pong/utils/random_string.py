import base64
import os

def generate_random_bytes(length=16):
    return os.urandom(length)

def generate_base32_encoded_random_string(length=16):
    return base64.b32encode(generate_random_bytes(length)).decode('utf-8').strip('=')
