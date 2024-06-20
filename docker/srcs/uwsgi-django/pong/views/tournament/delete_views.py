# docker/srcs/uwsgi-django/pong/views/tournament/delete_views.py
import logging
from django.http import JsonResponse, HttpResponse
from ...models import Tournament, Match
from django.db import transaction
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

logger = logging.getLogger('django')
User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_tournament_and_matches(request, tournament_id) -> JsonResponse:
	""" 
	機能:
	- 削除: トーナメントと「全7試合」。ログイン中のユーザーが主催者のものを。
	- 備考: このトーナメントに関連する「match」7試合も全て削除される。
	"""
	try:
		with transaction.atomic():
			tournament = Tournament.objects.get(id=tournament_id, organizer=request.user)
			if not tournament.is_finished:
				# トーナメントに関連する試合も削除
				# #class Match(models.Model):において、
				# - tournament = models.ForeignKey(Tournament, related_name='matches', on_delete=models.CASCADE)が設定されている 
				# - related_name='matches' で逆方向のリレーションシップ
				# - on_delete=models.CASCADE でトーナメントが削除されると、自動的に削除される。
				tournament.matches.all().delete() #つまり、この行は不要。だが、明示的に記述する。
				tournament.delete()
				return JsonResponse({'status': 'success', 'message': 'Tournament and related matches deleted successfully.'}, status=200)
			else:
				return JsonResponse({'status': 'error', 'message': 'Cannot delete finished tournaments.'}, status=400)
	except Tournament.DoesNotExist:
		return JsonResponse({'status': 'error', 'message': 'Tournament not found.'}, status=404)
