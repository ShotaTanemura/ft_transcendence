from django.contrib import admin
from pong.models.user import User, Users2FA

admin.site.register(User)
admin.site.register(Users2FA)
