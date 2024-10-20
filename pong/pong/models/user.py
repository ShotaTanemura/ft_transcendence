from django.db import models
import uuid
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django import forms
from django.contrib.auth import get_user_model
from pong.utils.random_string import generate_base32_encoded_random_string


class UserManager(BaseUserManager):
    def create_user(self, name, nickname, email, password, icon=None, **extra_fields):
        if not name:
            raise ValueError("UserIDを入力してください")
        if not nickname:
            raise ValueError("NickNameを入力してください")
        if not email:
            raise ValueError("メールアドレスを入力してください")
        if not password:
            raise ValueError("パスワードを入力してください")

        email = self.normalize_email(email)
        user = self.model(name=name, email=email, nickname=nickname, **extra_fields)
        if icon:
            user.icon = icon

        user.set_password(password)
        user.save(using=self._db)

        Users2FA.objects.create(user=user)

        return user

    def create_superuser(self, name, nickname, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(name, nickname, email, password, **extra_fields)

    def get_user_email(self, email):
        return self.get(email=email)

    def get_user_nickname(self, nickname):
        return self.get(nickname=nickname)


class User(AbstractBaseUser, PermissionsMixin):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(unique=True, blank=False, max_length=20)
    email = models.EmailField(unique=True, blank=False)
    nickname = models.CharField(
        unique=True, blank=False, default="sample", max_length=20
    )
    is_staff = models.BooleanField(default=False)
    icon = models.ImageField(
        upload_to="uploads", blank=True, null=True, default="defaults/default.jpeg"
    )
    objects = UserManager()

    USERNAME_FIELD = "name"
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.name

    class Meta:
        db_table = "users"


class UserIconUpdateForm(forms.ModelForm):
    class Meta:
        model = get_user_model()
        fields = ["icon"]


class Users2FA(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, blank=False, null=False, editable=False, on_delete=models.CASCADE
    )
    is_active = models.BooleanField(default=False)
    secret = models.CharField(
        blank=False, null=False, default=generate_base32_encoded_random_string
    )
