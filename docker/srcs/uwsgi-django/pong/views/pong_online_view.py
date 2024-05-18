# docker/srcs/uwsgi-django/pong/views/online_pong_view.py
import logging
from django.shortcuts import redirect, render
from django.http import JsonResponse
# from ..models import Tournament, Match
from django.shortcuts import get_object_or_404
from django.conf import settings

logger = logging.getLogger(__name__)

def pong_online(request):
	logger.debug("pong_online スタート")
	if request.method == 'GET':
		return render(request, 'pong/pong-online.html')
	else:
		return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)