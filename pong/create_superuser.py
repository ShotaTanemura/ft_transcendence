import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

User = get_user_model()

superuser_name = os.environ.get("DJANGO_SUPERUSER_USERNAME")
superuser_password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")
superuser_email = os.environ.get("DJANGO_SUPERUSER_EMAIL")

if superuser_name and superuser_password:
    if not User.objects.filter(name=superuser_name).exists():
        print(f"Creating superuser {superuser_name}")
        User.objects.create_superuser(
            name=superuser_name,
            nickname="sample",
            email=superuser_email,
            password=superuser_password,
        )
    else:
        print(f"Superuser {superuser_name} already exists")
else:
    print("Superuser credentials not provided")

for i in range(1, 5):
    user_name = f"user{i}"
    user_email = f"{i}@{i}.com"
    user_password = "7ranCendenCe"
    if not User.objects.filter(name=user_name).exists():
        print(f"Creating user {user_name}")
        User.objects.create_user(
            name=user_name,
            nickname=f"sample{i}",
            email=user_email,
            password=user_password,
        )
    else:
        print(f"User {user_name} already exists")
