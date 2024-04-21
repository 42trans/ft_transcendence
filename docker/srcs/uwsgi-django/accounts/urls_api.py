# accounts/urls_api.py

from django.urls import include, path

from accounts.views.basic_auth import SignupAPIView
from accounts.views.basic_auth import LogoutAPIView
from accounts.views.basic_auth import LoginAPIView
from accounts.views.user import UserProfileAPIView
from accounts.views.user import EditUserProfileAPIView
from accounts.views.oauth import OAuthWith42
from accounts.views.two_factor_auth import Enable2FaAPIView
from accounts.views.two_factor_auth import Verify2FaAPIView
from accounts.views.jwt import JWTRefreshView


app_name = 'api_accounts'

# API用のURLパターン（国際化の影響を受けない）
urlpatterns = [
    path('api/signup/', SignupAPIView.as_view(), name='api_signup'),
    path('api/login/', LoginAPIView.as_view(), name='api_login'),
    path('api/logout/', LogoutAPIView.as_view(), name='api_logout'),
    path('api/user/profile/', UserProfileAPIView.as_view(), name='api_user_profile'),
    path('api/user/edit-profile/', EditUserProfileAPIView.as_view(), name='api_edit_profile'),
    path('api/enable_2fa/', Enable2FaAPIView.as_view(), name='api_enable_2fa'),
    path('api/verify_2fa/', Verify2FaAPIView.as_view(), name='api_verify_2fa'),

    path('api/token/refresh/', JWTRefreshView.as_view(), name='api_token_refresh'),

    path('oauth-ft/callback/', OAuthWith42.as_view(), name='oauth_ft_callback'),
]
