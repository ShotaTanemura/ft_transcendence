**DjangoでWebSocket通信の設定とテスト**

このドキュメントでは、DjangoプロジェクトでWebSocket通信を設定し、テストするためのステップを説明します。

**Djangoのinstall**

`pip install django`

**Django Channelsのインストール**

`pip install channels`

**Daphneサーバーのインストール**

`pip install daphne`

**WebSocketクライアントツールのインストール (例: wscat)**

`npm install -g wscat`

**Django プロジェクト全体を作成**

`django-admin startproject <project_name> `
`cd websocket`

**存在するDjangoプロジェクト内に新しいアプリを作成**

`python manage.py startapp <app_name>`
**INSTALLED_APPSに'channels'を追加**
websocket/settings.py
```js
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

**ASGI_APPLICATIONの設定**

`ASGI_APPLICATION = 'yourproject.routing.application`

**Djangoプロジェクトのマイグレーション実行**

`python manage.py migrate`


### 検証

**DaphneサーバーでのDjangoプロジェクト起動**

`daphne -p 8000 yourproject.asgi:application`

`{"message": "hello"}`


`python manage.py startapp yourapp`