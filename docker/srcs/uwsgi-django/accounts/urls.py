from . import views
from django.urls import include, path

app_name = 'accounts'

urlpatterns = [
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),

    path('oauth-ft/', views.oauth_ft, name='oauth_ft'),
    path('oauth-ft-callback/', views.oauth_ft_callback, name='oauth_ft_callback'),

    path('logout/', views.logout_view, name='logout'),

    path('user/', views.user_view, name='user'),
    path('edit/', views.edit_profile, name='edit'),
]
