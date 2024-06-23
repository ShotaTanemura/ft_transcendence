# Generated by Django 5.0.3 on 2024-06-23 11:28

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ApiToken42',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token', models.CharField(unique=True)),
                ('salt', models.CharField(unique=True)),
                ('user', models.ForeignKey(db_column='uuid', on_delete=django.db.models.deletion.CASCADE, related_name='api_tokens_42', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
