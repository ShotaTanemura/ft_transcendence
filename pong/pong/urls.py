from django.urls import path
from .views import users, friends
from django.conf import settings
from django.conf.urls.static import static
from .views import auth, oauth, two_factor

app_name = "pong"
urlpatterns = [
    path("api/v1/auth/register", auth.register, name="register"),
    path("api/v1/auth/token", auth.create_token, name="token"),
    path("api/v1/auth/token/refresh", auth.refresh_token, name="refresh"),
    path("api/v1/auth/token/verify", auth.verify_token, name="verify"),
    path("api/v1/auth/two-factor/provisioning", two_factor.provisioning, name="tfa_provisioning"),
    path("api/v1/users/<uuid:uuid>", users.user, name="user"),
    path("api/v1/users/<uuid:uuid>/icon", users.user_icon, name="user_icon"),
    path("api/v1/users/others/<str:name>", users.other_user, name="other_user"),
    path("api/v1/users/status/<str:name>", users.user_status, name="user_status"),
    path("api/v1/users/search/<str:name>", users.searched_users, name="searched_users"),
    path("api/v1/friends/friends", friends.get_friends, name="get_friends"),
    path(
        "api/v1/friends/friends/pending",
        friends.get_pending_friends,
        name="get_pending_friends",
    ),
    path(
        "api/v1/friends/friends/requested",
        friends.get_requested_friends,
        name="get_requested_friends",
    ),
    path(
        "api/v1/friends/request/send",
        friends.send_friend_request,
        name="send_friend_request",
    ),
    path(
        "api/v1/friends/request/approve",
        friends.approve_friend_request,
        name="approve_friend_request",
    ),
    path("api/v1/auth/token/revoke", auth.revoke_token, name="revoke"),
    path("oauth/42/signup", oauth.oauth_42_signup, name="oauth42_signup"),
    path("oauth/42/signin", oauth.oauth_42_signin, name="oauth42_signin"),
    path("oauth/callback/42", oauth.callback_42, name="callback42"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
