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
        try:
            user = request.user

            id = kwargs.get('user_id', None)
            block_user = CustomUser.objects.get(id=id)

            if user == block_user:
                response = {'error': 'Cannot block yourself'}
                return Response(response, status=status.HTTP_200_OK)

            if user.is_blocking_user(block_user):
                response = {'error': 'Already blocked'}
                return Response(response, status=status.HTTP_200_OK)

            user.block_user(block_user)
            response = {'message': f'User {block_user.nickname} successfully blocked'}
            return Response(response, status=status.HTTP_200_OK)

        except CustomUser.DoesNotExist:
            response = {'error': f'User not found'}
            return Response(response, status=status.HTTP_200_OK)
        except Exception as e:
            response = {'error': f'Unexpected error: {str(e)}'}
            return Response(response, status=status.HTTP_200_OK)


class UnblockUserAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs) -> Response:
        try:
            user = request.user

            id = kwargs.get('user_id', None)
            unblock_user = CustomUser.objects.get(id=id)

            if user == unblock_user:
                response = {'error': 'Cannot unblock yourself'}
                return Response(response, status=status.HTTP_200_OK)

            if not user.is_blocking_user(unblock_user):
                response = {'error': 'Already un blocked'}
                return Response(response, status=status.HTTP_200_OK)

            user.unblock_user(unblock_user)
            response = {'message': f'User {unblock_user.nickname} successfully unblocked'}
            return Response(response, status=status.HTTP_200_OK)

        except CustomUser.DoesNotExist:
            response = {'error': f'User not found'}
            return Response(response, status=status.HTTP_200_OK)
        except Exception as e:
            response = {'error': f'Unexpected error: {str(e)}'}
            return Response(response, status=status.HTTP_200_OK)
