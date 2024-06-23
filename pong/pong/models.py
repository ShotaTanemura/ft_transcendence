from django.db import models
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from pong.utils import encryption


class UserManager(BaseUserManager):
	def create_user(self, name, email, password, **extra_fields):
		if not name:
			raise ValueError('UserIDを入力してください')

		if not email:
			raise ValueError('メールアドレスを入力してください')

		if not password:
			raise ValueError('パスワードを入力してください')

		# Emailを正規化
		email = self.normalize_email(email)
		# モデルインスタンスを作成
		user = self.model(
			name = name,
			email = email,
			# ここでこれを返さないと謎のエラーでsupercreateuserがつくれない
			**extra_fields  
		)
		# パスワードをハッシュ化
		user.set_password(password)
		# ユーザーを保存
		user.save(using=self._db)
		return user

	# extra_fieldsは、ユーザーを作成する際に追加で設定できる属性の辞書を指します。
	def create_superuser(self, name, email, password, **extra_fields):
		extra_fields.setdefault('is_staff', True)
		extra_fields.setdefault('is_superuser', True)

		if extra_fields.get('is_staff') is not True:
			raise ValueError(_('Superuser must have is_staff=True.'))
		if extra_fields.get('is_superuser') is not True:
			raise ValueError(_('Superuser must have is_superuser=True.'))

		# createuserを呼び出しているため同じ値が必要
		return self.create_user(name, email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
	uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	name = models.CharField(unique=True, blank=False, max_length=20)
	email = models.EmailField(unique=True, blank=False)
	is_staff = models.BooleanField(default=False)

	objects = UserManager()

	USERNAME_FIELD = 'name'
	REQUIRED_FIELDS = ['email']

	def __str__(self):
		return self.name

	class Meta:
		db_table = 'users'

class ApiToken42(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='uuid', related_name='api_tokens_42')
	token = models.CharField(unique=True, blank=False)
	salt = models.CharField(unique=True, blank=False)

	def save(self, *args, **kwargs):
        if not self.token:
            raise ValueError("Token must be provided before saving.")
		self.salt = encryption.generate_salt()
        self.token = encryption.encrypt_data(self.token, self.salt)
        super(ApiToken42, self).save(*args, **kwargs)
