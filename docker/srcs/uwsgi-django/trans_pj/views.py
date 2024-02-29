# docker/srcs/ft_django/ft_django_pj/views.py
from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse

def index(request):
    return HttpResponse("<h1>[Django]</h1> <p>index pageです</p>")

def api_status(request):
    # 必要なロジックを実装し、適切なレスポンスを返します
    data = {'api/status/': 'OK'}
    return JsonResponse(data)
