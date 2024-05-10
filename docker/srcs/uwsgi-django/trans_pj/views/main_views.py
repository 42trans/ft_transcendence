# docker/srcs/ft_django/ft_django_pj/views.py
from django.shortcuts import render
import os
from django.http import HttpResponse
from django.http import JsonResponse

# def index(request):
#     return HttpResponse("<h1>[Django]</h1> <p>index pageです</p>")

def index(request):
	# 環境変数を読み込み
	nginx_ssl_port = os.getenv('NGINX_SSL_PORT', '443')
	frontend_port = os.getenv('FRONTEND_PORT', '3030')
	# pgadmin_port = os.getenv('PGADMIN_PORT', '8087')
	ptometheus_port = os.getenv('PROMETHEUS_PORT', '9091')
	grafana_port = os.getenv('GRAFANA_PORT', '3032')
	kibana_port = os.getenv('KIBANA_PORT', '5601')

	admin_name = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
	admin_email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
	admin_pass = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin01234')

	# コンテキストとして渡す
	context = {
		'nginx_ssl_port': nginx_ssl_port,
		'frontend_port': frontend_port,
		# 'pgadmin_port': pgadmin_port,
		'ptometheus_port': ptometheus_port,
		'grafana_port': grafana_port,
		'kibana_port': kibana_port,
		'admin_name': admin_name,
		'admin_email': admin_email,
		'admin_pass': admin_pass,
	}
	return render(request, 'index.html', context)

def api_status(request):
	data = {'api/status/': 'OK'}
	return JsonResponse(data)



def spa(request):
	return render(request, 'spa.html')

# テスト用　後で消す
def lang(request):
	return render(request, 'lang_test.html')

def script(request):
	return render(request, 'script.html')

def script2(request):
	return render(request, 'script2.html')