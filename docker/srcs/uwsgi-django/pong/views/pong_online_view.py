# docker/srcs/uwsgi-django/pong/views/online_pong_view.py
import logging
from django.shortcuts import redirect, render
from django.http import JsonResponse
# from ..models import Tournament, Match
# from django.shortcuts import get_object_or_404
# from django.conf import settings
from django.contrib.auth.decorators import login_required

logger = logging.getLogger(__name__)

@login_required
def pong_online_duel(request):
	if request.method == 'GET':
		return render(request, 'pong/pong-online-duel.html')
	else:
		return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)

# @login_required外すとGuestでも機能してしまう。room idは適当に振られてしまう
@login_required
def pong_online(request):
	if request.method == 'GET':
		return render(request, 'pong/pong-online.html')
	else:
		return JsonResponse({'status': 'error', 'message': 'Invalid request method.'}, status=405)