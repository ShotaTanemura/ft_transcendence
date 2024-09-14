# Generated by Django 5.0.3 on 2024-09-08 03:00

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("chat", "0007_rooms_room_type"),
    ]

    operations = [
        migrations.AddField(
            model_name="userrooms",
            name="user_room_status",
            field=models.CharField(
                choices=[
                    ("active", "Active"),
                    ("inactive", "Inactive"),
                    ("invited", "Invited"),
                ],
                default="active",
                max_length=8,
            ),
        ),
    ]
