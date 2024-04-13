# accounts/urls.py

from django.urls import include, path

from accounts.views.basic_auth import SignupTemplateView, SignupAPIView
from accounts.views.basic_auth import LogoutTemplateView, LogoutAPIView
from accounts.views.basic_auth import LoginTemplateView, LoginAPIView
from accounts.views.user import UserProfileView, UserProfileAPIView
from accounts.views.user import EditUserProfileTemplateView, EditUserProfileAPIView
from accounts.views.oauth import OAuthWith42
from accounts.views.two_factor_auth import Disable2FaView
from accounts.views.two_factor_auth import Enable2FaTemplateView, Enable2FaAPIView
from accounts.views.two_factor_auth import Verify2FaTepmlateView, Verify2FaAPIView

app_name = 'accounts'

urlpatterns = [
    path('signup/', SignupTemplateView.as_view(), name='signup'),
    path('login/', LoginTemplateView.as_view(), name='login'),

    path('oauth-ft/', OAuthWith42.as_view(), name='oauth_ft'),
    path('oauth-ft/callback/', OAuthWith42.as_view(), name='oauth_ft_callback'),

    path('logout/', LogoutTemplateView.as_view(), name='logout'),

    path('user/', UserProfileView.as_view(), name='user'),
    path('edit/', EditUserProfileTemplateView.as_view(), name='edit'),

    path('verify/disable_2fa/', Disable2FaView.as_view(), name='disable_2fa'),
    path('verify/enable_2fa/', Enable2FaTemplateView.as_view(), name='enable_2fa'),
    path('verify/verify_2fa/', Verify2FaTepmlateView.as_view(), name='verify_2fa'),

    path('api/signup/', SignupAPIView.as_view(), name='api_signup'),
    path('api/login/', LoginAPIView.as_view(), name='api_login'),
    path('api/logout/', LogoutAPIView.as_view(), name='api_logout'),
    path('api/user/profile/', UserProfileAPIView.as_view(), name='api_user_profile'),
    path('api/user/edit-profile/', EditUserProfileAPIView.as_view(), name='api_edit_profile'),
    path('api/enable_2fa/', Enable2FaAPIView.as_view(), name='api_enable_2fa'),
    path('api/verify_2fa/', Verify2FaAPIView.as_view(), name='api_verify_2fa'),
]
