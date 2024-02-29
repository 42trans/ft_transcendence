# docker/srcs/ft_django/ft_django_pj/urls.py
"""

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
from django.urls import include, path
from . import views 

urlpatterns = [
    path('metrics/', include('django_prometheus.urls')),
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),
	# 新しいURLパターンを追加
    # path('bootstrap_test/', views.bootstrap_test, name='bootstrap_test'),  
	path('api/status/', views.api_status, name='api_status'),
]

