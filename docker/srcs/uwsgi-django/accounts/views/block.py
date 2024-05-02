# accounts/views/block.py

from django.http import JsonResponse
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from accounts.models import CustomUser

import logging


logging.basicConfig(
    level=logging.ERROR,
    format='%(asctime)s - %(levelname)s - %(message)s - [in %(funcName)s: %(lineno)d]',
)
logger = logging.getLogger(__name__)


class BlockUserAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs) -> Response:
        nickname = kwargs.get('nickname', None)
        try:
            block_user = CustomUser.objects.get(nickname=nickname)
            request.user.block_user(block_user)
            response = {
                'message': f'User {nickname} successfully blocked'
            }
            return Response(response, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            response = {
                'message': f'User {nickname} not found'
            }
            return Response(response, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            response = {
                'message': f'Unexpected error: {str(e)}'
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)


class UnblockUserAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs) -> Response:
        nickname = kwargs.get('nickname', None)
        try:
            unblock_user = CustomUser.objects.get(nickname=nickname)
            request.user.unblock_user(unblock_user)
            response = {
                'message': f'User {nickname} successfully unblocked'
            }
            return Response(response, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            response = {
                'message': f'User {nickname} not found'
            }
            return Response(response, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            response = {
                'message': f'Unexpected error: {str(e)}'
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)
