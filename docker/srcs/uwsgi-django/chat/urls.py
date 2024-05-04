# chat/urls.py

from django.urls import path, re_path
from chat.views.views import dm_list, dm_with


app_name = 'chat'

urlpatterns = [
    path('dm-list/', dm_list, name='dm_list'),
    path('dm-with/<str:nickname>/', dm_with, name='dm'),
]
