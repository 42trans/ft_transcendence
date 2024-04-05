# from . import views
from accounts.views.basic_auth import SignupView, LoginView, LogoutView
from accounts.views import oauth, user
from django.urls import include, path

app_name = 'accounts'

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),

    path('oauth-ft/', oauth.oauth_ft, name='oauth_ft'),
    path('oauth-ft-callback/', oauth.oauth_ft_callback, name='oauth_ft_callback'),

    path('logout/', LogoutView.as_view(), name='logout'),

    path('user/', user.user_view, name='user'),
    path('edit/', user.edit_profile, name='edit'),
]
