# Generated by Django 5.0.3 on 2024-08-20 10:15

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("realtime_pong_game", "0004_roomparticipantmapper_created_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="matchinfo",
            name="created_at",
            field=models.DateTimeField(auto_now=True),
        ),
    ]
