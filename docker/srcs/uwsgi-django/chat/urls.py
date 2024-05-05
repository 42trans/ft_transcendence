# chat/urls.py

from django.urls import path, re_path
from chat.views.views import DMSessionsView, DMView


app_name = 'chat'

urlpatterns = [
    path('dm-sessions/', DMSessionsView.as_view(), name='dm_sessions'),
    path('dm-with/<str:target_nickname>/', DMView.as_view(), name='dm'),
]
