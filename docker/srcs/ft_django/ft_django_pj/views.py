
from django.shortcuts import render
from django.http import HttpResponse

def index(request):
    return HttpResponse("<h1>[Django]</h1> <p>index pageです</p>")

def bootstrap_test(request):
    return render(request, 'bootstrap_test.html')
