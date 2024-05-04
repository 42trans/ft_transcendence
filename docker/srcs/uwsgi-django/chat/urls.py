# chat/urls.py

from django.urls import path, re_path
from chat.views.views import DMList, DMView


app_name = 'chat'

urlpatterns = [
    path('dm-list/', DMList.as_view(), name='dm_list'),
    path('dm-with/<str:nickname>/', DMView.as_view(), name='dm'),
]
