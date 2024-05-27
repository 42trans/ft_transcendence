# docker/srcs/uwsgi-django/pong/views/online_pong_view.py
import logging
from django.shortcuts import redirect, render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

logger = logging.getLogger(__name__)

# @login_required外すとGuestでも機能してしまう。room idは適当に振られてしまう
@login_required
def pong_online(request):
	if request.method == 'GET':
		return render(request, 'pong/pong-online.html')
	else:
		return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)