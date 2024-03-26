# docker/srcs/ft_django/ft_django_pj/views.py
from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse

# def index(request):
#     return HttpResponse("<h1>[Django]</h1> <p>index pageです</p>")

def index(request):
	return render(request, 'index.html')

def api_status(request):
	data = {'api/status/': 'OK'}
	return JsonResponse(data)
