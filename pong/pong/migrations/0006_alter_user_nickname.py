# Generated by Django 5.0.3 on 2024-10-12 08:28

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("pong", "0005_alter_user_nickname"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="nickname",
            field=models.CharField(default="sample", max_length=20, unique=True),
        ),
    ]
