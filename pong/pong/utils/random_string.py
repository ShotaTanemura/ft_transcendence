import string
import random
import base64

def generate_raondom_string(length=12):
    return ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(length))

def generate_base32_encoded_raondom_string(length=12):
    return base64.b32encode(bytearray(generate_raondom_string(length), 'ascii')).decode('utf-8')
