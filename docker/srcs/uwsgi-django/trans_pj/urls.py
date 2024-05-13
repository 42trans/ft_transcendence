# docker/srcs/uwsgi-django/trans_pj/urls.py
"""
URL configuration for trans_pj project.

The `urlpatterns` list routes URLs to views. For more information please see:
	https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
	1. Add an import:  from my_app import views
	2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
	1. Add an import:  from other_app.views import Home
	2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
	1. Import the include() function: from django.urls import include, path
	2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path, re_path
from trans_pj.views import main_views  
from django.conf.urls.i18n import i18n_patterns
import accounts.urls, accounts.urls_api
import chat.urls, chat.urls_api

urlpatterns = [
	path("i18n/", include("django.conf.urls.i18n")),
]

# API
urlpatterns += [
	path('accounts/', include(accounts.urls_api)),
	path('pong/api/', include('pong.urls_api')), 
	path('chat/', include(chat.urls_api)),
]

# 国際化対象のURLパターン
urlpatterns += i18n_patterns(
	path('pong/', include('pong.urls')),
	path('', include('django_prometheus.urls')),
	path('admin/', admin.site.urls),
	path('api/status/', main_views.api_status, name='api_status'),
	path('accounts/', include(accounts.urls)),
	path('chat/', include(chat.urls)),

	# テスト用　削除予定
	path('home', main_views.index, name='home'),
	path('lang', main_views.lang, name='lang'),
	path('script', main_views.script, name='script'),
	path('script2', main_views.script2, name='script2'),

	# SPA
	path('', main_views.spa, name='index'),
	# re_path(r'\w*', main_views.spa, name='index'),

	prefix_default_language=True
)
