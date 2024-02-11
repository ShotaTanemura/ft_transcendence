**DjangoでWebSocket通信の設定とテスト**

このドキュメントでは、DjangoプロジェクトでWebSocket通信を設定し、テストするためのステップを説明します。

**Djangoのinstall**

`pip install django`

**1. Django Channelsのインストール**

`pip install channels`

1. **INSTALLED_APPSに'channels'を追加**

```jsx
INSTALLED_APPS = [
    # 既存のDjangoアプリケーション
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Channelsを追加
    'channels',
]
```

3.**ASGI_APPLICATIONの設定**

`ASGI_APPLICATION = 'yourproject.routing.application`

4.**Djangoプロジェクトのマイグレーション実行**

`python manage.py migrate`

5.**Daphneサーバーのインストール**

`pip install daphne`

6.**WebSocketクライアントツールのインストール (例: wscat)**

`npm install -g wscat`

### 検証

**DaphneサーバーでのDjangoプロジェクト起動**

`daphne -p 8000 yourproject.asgi:application`

`{"message": "hello"}`