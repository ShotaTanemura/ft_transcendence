# Generated by Django 5.0.3 on 2024-10-10 07:21

import django.db.models.deletion
import pong.utils.random_string
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0005_alter_user_nickname'),
    ]

    operations = [
        migrations.CreateModel(
            name='Users2FA',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('is_active', models.BooleanField(default=False)),
                ('secret', models.CharField(default=pong.utils.random_string.generate_base32_encoded_random_string)),
                ('user', models.ForeignKey(editable=False, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
