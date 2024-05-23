# docker/srcs/uwsgi-django/pong/views/online_pong_view.py
import logging
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

logger = logging.getLogger(__name__)

@login_required
def pong_online_duel(request):
	if request.method == 'GET':
		return render(request, 'pong/online/duel/duel-session.html')
	else:
		return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)
