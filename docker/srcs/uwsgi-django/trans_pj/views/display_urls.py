from django.http import HttpResponse
from django.urls import URLPattern, URLResolver
import importlib.util

def list_urls_from_file(file_path):
    spec = importlib.util.spec_from_file_location("urls", file_path)
    urls_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(urls_module)
    return [str(pattern.pattern) for pattern in urls_module.urlpatterns if isinstance(pattern, URLPattern)]

def display_urls(request):
    urls_files = [
        'docker/srcs/uwsgi-django/trans_pj/urls.py',
        'docker/srcs/uwsgi-django/pong/urls.py'
    ]
    urls_list = []
    for file_path in urls_files:
        urls = list_urls_from_file(file_path)
        urls_list.extend(urls)
    
    html_content = '<ul>' + ''.join([f'<li>{url}</li>' for url in urls_list]) + '</ul>'
    return HttpResponse(html_content)
