# chat/urls.py

from django.urls import path, re_path

from . import views, consumers


app_name = 'chat'

urlpatterns = [
    path('api/dm/<str:nickname>/', views.dm_view, name='api_dm'),
]
