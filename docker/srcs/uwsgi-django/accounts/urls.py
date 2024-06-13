# accounts/urls.py

from django.urls import include, path

from accounts.views.basic_auth import SignupTemplateView
from accounts.views.basic_auth import LogoutTemplateView
from accounts.views.basic_auth import LoginTemplateView
from accounts.views.user import UserProfileView, get_user_info, ChangeAvatarView
from accounts.views.user import EditUserProfileTemplateView
from accounts.views.user import GetUserHistoryTemplateView
from accounts.views.friend import UserFriendsView
from accounts.views.oauth import OAuthWith42
from accounts.views.two_factor_auth import Disable2FaView
from accounts.views.two_factor_auth import Enable2FaTemplateView
from accounts.views.two_factor_auth import Verify2FaTepmlateView


app_name = 'accounts'

# 非API用のURLパターン（国際化設定を使用）
urlpatterns = [
    path('signup/', SignupTemplateView.as_view(), name='signup'),
    path('login/', LoginTemplateView.as_view(), name='login'),

    path('oauth-ft/', OAuthWith42.as_view(), name='oauth_ft'),

    path('logout/', LogoutTemplateView.as_view(), name='logout'),

    path('user/', UserProfileView.as_view(), name='user'),
    path('edit/', EditUserProfileTemplateView.as_view(), name='edit'),
    path('change-avatar/', ChangeAvatarView.as_view(), name='change_avatar'),

    path('history/', GetUserHistoryTemplateView.as_view(), name='history'),

    path('friends/', UserFriendsView.as_view(), name='friends'),

    path('info/<str:nickname>/', get_user_info, name='info'),

    path('verify/enable_2fa/', Enable2FaTemplateView.as_view(), name='enable_2fa'),
    path('verify/verify_2fa/', Verify2FaTepmlateView.as_view(), name='verify_2fa'),
]
