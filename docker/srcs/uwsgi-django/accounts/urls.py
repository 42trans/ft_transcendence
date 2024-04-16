# accounts/urls.py

from django.urls import include, path

from accounts.views.basic_auth import SignupView, LoginView, LogoutView
from accounts.views.user import UserPageView, EditUserProfileView
from accounts.views.oauth import OAuthWith42


app_name = 'accounts'

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),

    path('oauth-ft/', OAuthWith42.as_view(), name='oauth_ft'),

    path('logout/', LogoutView.as_view(), name='logout'),

    path('user/', UserPageView.as_view(), name='user'),
    path('edit/', EditUserProfileView.as_view(), name='edit'),
]
