# accounts/urls.py

from django.urls import include, path

from accounts.views.basic_auth import SignupView, LoginView, LogoutView
from accounts.views.user import UserProfileView, EditUserProfileView, UserProfileAPIView
from accounts.views.oauth import OAuthWith42
from accounts.views.two_factor_auth import Disable2FaView, Enable2FaView
from accounts.views.two_factor_auth import Verify2FaTepmlateView, Verify2FaAPIView

app_name = 'accounts'

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),

    path('oauth-ft/', OAuthWith42.as_view(), name='oauth_ft'),
    path('oauth-ft/callback/', OAuthWith42.as_view(), name='oauth_ft_callback'),

    path('logout/', LogoutView.as_view(), name='logout'),

    path('user/', UserProfileView.as_view(), name='user'),
    path('edit/', EditUserProfileView.as_view(), name='edit'),

    path('verify/disable_2fa/', Disable2FaView.as_view(), name='disable_2fa'),
    path('verify/enable_2fa/', Enable2FaView.as_view(), name='enable_2fa'),
    path('verify/verify_2fa/', Verify2FaTepmlateView.as_view(), name='verify_2fa'),

    path('api/user/profile/', UserProfileAPIView.as_view(), name='api_user_profile'),
    path('api/verify_2fa/', Verify2FaAPIView.as_view(), name='api_verify_2fa'),
]
