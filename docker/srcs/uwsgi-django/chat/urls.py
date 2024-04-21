from django.urls import path, re_path

from . import views, consumers


app_name = 'chat'

urlpatterns = [
    path('api/dm/<str:nickname>/', views.dm_view, name='dm'),
    path('<str:room_name>/', views.room, name='room'),
    path('', views.index, name='index'),
]

websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<room_name>\w+)/$", consumers.ChatConsumer.as_asgi()),
]
