# docker/srcs/uwsgi-django/pong/views/tournament/is_valid_match_api_view.py
import logging
from ...models import Tournament, Match
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger('django')
User = get_user_model()

class IsValidMatchIdAPI(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request, match_id) -> Response:
		try:
			match_id = int(match_id)
			if match_id <= 0:
				return Response({'exists': False}, status=status.HTTP_200_OK)
				# return Response({'exists': False}, status=status.HTTP_400_BAD_REQUEST)

			match_exists = Match.objects.filter(id=match_id).exists()
			return Response({'exists': match_exists}, status=status.HTTP_200_OK)

		except Exception:
			return Response({'exists': False}, status=status.HTTP_200_OK)
			# return Response({'exists': False}, status=status.HTTP_400_BAD_REQUEST)
