# accounts/urls_api.py

from django.urls import include, path

from accounts.views.basic_auth import SignupAPIView
from accounts.views.basic_auth import LogoutAPIView
from accounts.views.basic_auth import LoginAPIView
from accounts.views.user import UserProfileAPIView
from accounts.views.user import EditUserProfileAPIView
from accounts.views.user import change_avatar
from accounts.views.oauth import OAuthWith42
from accounts.views.two_factor_auth import Enable2FaAPIView
from accounts.views.two_factor_auth import Verify2FaAPIView
from accounts.views.jwt import JWTRefreshView
from accounts.views.block import BlockUserAPI, UnblockUserAPI
from accounts.views.friend import send_friend_request, cancel_friend_request, delete_friend
from accounts.views.friend import accept_friend_request, reject_friend_request
from accounts.views.friend import get_friends, get_friend_requests

app_name = 'api_accounts'

# API用のURLパターン（国際化の影響を受けない）
urlpatterns = [
    path('api/signup/'              , SignupAPIView.as_view()           , name='api_signup'),
    path('api/login/'               , LoginAPIView.as_view()            , name='api_login'),
    path('api/logout/'              , LogoutAPIView.as_view()           , name='api_logout'),
    path('api/user/profile/'        , UserProfileAPIView.as_view()      , name='api_user_profile'),
    path('api/user/edit-profile/'   , EditUserProfileAPIView.as_view()  , name='api_edit_profile'),
    path('api/change-avatar/'       , change_avatar                     , name='change_avatar'),
    path('api/enable_2fa/'          , Enable2FaAPIView.as_view()        , name='api_enable_2fa'),
    path('api/verify_2fa/'          , Verify2FaAPIView.as_view()        , name='api_verify_2fa'),

    path('api/token/refresh/'       , JWTRefreshView.as_view()          , name='api_token_refresh'),
    path('oauth-ft/callback/'       , OAuthWith42.as_view()             , name='oauth_ft_callback'),

    path('api/block/<str:nickname>/'    , BlockUserAPI.as_view()        , name='api_block'),
    path('api/unblock/<str:nickname>/'  , UnblockUserAPI.as_view()      , name='api_unblock'),

    path('api/friend/send-request/<int:user_id>/'   , send_friend_request  , name='send_friend_request'),
    path('api/friend/cancel-request/<int:user_id>/' , cancel_friend_request, name='cancel_friend_request'),
    path('api/friend/accept-request/<int:user_id>/' , accept_friend_request, name='accept_friend_request'),
    path('api/friend/reject-request/<int:user_id>/' , reject_friend_request, name='reject_friend_request'),
    path('api/friend/delete/<int:user_id>/'         , delete_friend        , name='delete_friend'),

    path('api/friend/requests/'                     , get_friend_requests  , name='friend_requests'),
    path('api/friend/list/'                         , get_friends          , name='friend_list'),
]
