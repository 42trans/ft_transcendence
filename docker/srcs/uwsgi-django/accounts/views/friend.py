import logging
from django.http import JsonResponse
from accounts.models import CustomUser, Friend, UserStatus
from django.views.decorators.csrf import csrf_exempt
from django.db.models import F, Q
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s - [in %(funcName)s: %(lineno)d]',
)

logger = logging.getLogger('accounts')


def _get_user_and_friend(request, friend_user_id):
    err = None

    try:
        user = request.user
        friend = CustomUser.objects.get(id=friend_user_id)

        if user == friend:
            err = 'Cannot send request to yourself'
            return None, None, err

        return user, friend, err

    except CustomUser.DoesNotExist:
        err = 'User not found'
        return None, None, err


class SendFriendRequestAPI(APIView):
    """
    user_idと友人申請関係がなく友人関係にない場合、
    Friend object(status=PENDING)を作成する
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id) -> Response:
        try:
            user, friend_request_target, err = _get_user_and_friend(request, user_id)
            if err is not None:
                response = {'error': err}
                return Response(response, status=status.HTTP_400_BAD_REQUEST)

            if Friend.is_friend(user, friend_request_target):
                response = {'error': 'Already friend'}
                return Response(response, status=status.HTTP_400_BAD_REQUEST)

            if (Friend.is_already_sent(user, friend_request_target)
                    or Friend.is_already_received(user, friend_request_target)):
                response = {'error': 'Friend request already friends'}
                return Response(response, status=status.HTTP_400_BAD_REQUEST)

            Friend.objects.create(sender=user, receiver=friend_request_target)
            response = {'status': 'Friend request sent successfully'}
            return Response(response)

        except CustomUser.DoesNotExist:
            error_msg = 'User not found'
            error_status = status.HTTP_400_BAD_REQUEST
        except Exception as e:
            error_msg = f'Unexpected error: {str(e)}'
            error_status = status.HTTP_500_INTERNAL_SERVER_ERROR
        response = {'error': error_msg}
        return Response(response, status=error_status)


class CancelFriendRequestAPI(APIView):
    """
    user_idへ送信したFriend Requestをキャンセル
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id) -> Response:
        try:
            user, friend_request_target, err = _get_user_and_friend(request, user_id)
            if err is not None:
                response = {'error': err}
                return Response(response, status=status.HTTP_400_BAD_REQUEST)

            # リクエストを取得
            friend_request = Friend.objects.get(sender=user,
                                                receiver=friend_request_target,
                                                status='pending')

            # リクエストをデータベースから削除
            friend_request.delete()
            response = {'status': 'Friend request cancelled'}
            return Response(response, status=status.HTTP_200_OK)

        except CustomUser.DoesNotExist:
            error_msg = 'User not found'
            error_status = status.HTTP_400_BAD_REQUEST
        except Friend.DoesNotExist:
            error_msg = 'Friend request not found'
            error_status = status.HTTP_400_BAD_REQUEST
        except Exception as e:
            error_msg = f'Unexpected error: {str(e)}'
            error_status = status.HTTP_500_INTERNAL_SERVER_ERROR
        response = {'error': error_msg}
        return Response(response, status=error_status)


class AcceptFriendRequestAPI(APIView):
    """
    user_idから受信したFriend Requestを承認
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id) -> Response:
        try:
            user, request_sender, err = _get_user_and_friend(request, user_id)
            if err is not None:
                response = {'error': err}
                return Response(response, status=status.HTTP_400_BAD_REQUEST)

            # request_sender -> user へのPending状態のリクエストリクエストを取得
            friend_request = Friend.objects.get(sender=request_sender,
                                                receiver=user,
                                                status='pending')

            # リクエストのステータスを更新
            friend_request.status = Friend.FriendStatus.ACCEPTED
            friend_request.save()
            response = {'status': 'Success: accept request'}
            return Response(response, status=status.HTTP_200_OK)

        except CustomUser.DoesNotExist:
            error_msg = 'User not found'
            error_status = status.HTTP_400_BAD_REQUEST
        except Friend.DoesNotExist:
            error_msg = 'Friend request not found'
            error_status = status.HTTP_400_BAD_REQUEST
        except Exception as e:
            error_msg = f'Unexpected error: {str(e)}'
            error_status = status.HTTP_500_INTERNAL_SERVER_ERROR
        response = {'error': error_msg}
        return Response(response, status=error_status)


class RejectFriendRequestAPI(APIView):
    """
    user_idから受信したFriend Requestを未承認のまま削除する
    statusをREJECTEDに変更すると、再度Friend Requestを送信できないため、friend_requestを削除する
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id) -> Response:
        try:
            user, request_sender, err = _get_user_and_friend(request, user_id)
            if err is not None:
                response = {'error': err}
                return Response(response, status=status.HTTP_400_BAD_REQUEST)

            # request_sender -> user へのPending状態のリクエストリクエストを取得
            friend_request = Friend.objects.get(sender=request_sender,
                                                receiver=user,
                                                status='pending')

            # リクエストのステータスを更新
            friend_request.delete()
            return Response({'status': 'Success: reject request'}, status=status.HTTP_200_OK)

        except CustomUser.DoesNotExist:
            error_msg = 'User not found'
            error_status = status.HTTP_400_BAD_REQUEST
        except Friend.DoesNotExist:
            error_msg = 'Friend request not found'
            error_status = status.HTTP_400_BAD_REQUEST
        except Exception as e:
            error_msg = f'Unexpected error: {str(e)}'
            error_status = status.HTTP_500_INTERNAL_SERVER_ERROR
        response = {'error': error_msg}
        return Response(response, status=error_status)



class DeleteFriendAPI(APIView):
    """
    user_idとのfriend関係を削除する
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id) -> Response:
        try:
            user, friend, err = _get_user_and_friend(request, user_id)
            if err is not None:
                response = {'error': err}
                return Response(response, status=status.HTTP_400_BAD_REQUEST)

            friend_requests = Friend.objects.filter(
                Q(sender=user, receiver=friend) | Q(sender=friend, receiver=user),
                status='accepted'
            )

            if not friend_requests.exists():
                response = {'error': 'Friend not found.'}
                return Response(response, status=status.HTTP_400_BAD_REQUEST)

            friend_requests.delete()
            response = {'status': 'Success: delete friend'}
            return Response(response, status=status.HTTP_200_OK)

        except CustomUser.DoesNotExist:
            error_msg = 'User not found'
            error_status = status.HTTP_400_BAD_REQUEST
        except Friend.DoesNotExist:
            error_msg = 'Friend request not found'
            error_status = status.HTTP_400_BAD_REQUEST
        except Exception as e:
            error_msg = f'Unexpected error: {str(e)}'
            error_status = status.HTTP_500_INTERNAL_SERVER_ERROR
        response = {'error': error_msg}
        return Response(response, status=error_status)


class GetFriendListAPI(APIView):
    """
    userとのfriend関係にあるuser一覧を取得
    key: id, nickname, status
    """
    permission_classes = [IsAuthenticated]

    def get(self, request) -> Response:
        try:
            friends = self.__get_friends(request)
            friend_online_statues = self.__get_friend_online_statues(friends)

            # フレンドのステータス情報を追加
            friend_list = [{
                'id'        : friend['friend_id'],
                'nickname'  : friend['nickname'],
                'status'    : friend_online_statues.get(friend['friend_id'], False)
            } for friend in friends]

            # logger.debug(f'get_friends friends: {friend_list}')
            response = {'friends': friend_list}
            return Response(response, status=status.HTTP_200_OK)

        except CustomUser.DoesNotExist:
            error_msg = 'User not found'
            error_status = status.HTTP_400_BAD_REQUEST
        except Friend.DoesNotExist:
            error_msg = 'Friend request not found'
            error_status = status.HTTP_400_BAD_REQUEST
        except Exception as e:
            error_msg = f'Unexpected error: {str(e)}'
            error_status = status.HTTP_500_INTERNAL_SERVER_ERROR
        response = {'error': error_msg}
        logger.debug(f'get_friends friends: error: {error_msg}')

        return Response(response, status=error_status)


    def __get_friends(self, request) -> list:
        user = request.user

        # フレンドリクエストを取得
        friends_as_sender   = Friend.get_friends_as_sender(user, Friend.FriendStatus.ACCEPTED)
        friends_as_receiver = Friend.get_friends_as_receiver(user, Friend.FriendStatus.ACCEPTED)

        # リストを統合してソート
        friends         = friends_as_sender + friends_as_receiver
        friends_sorted  = sorted(friends, key=lambda x: x['nickname'])
        return friends_sorted

    def __get_friend_online_statues(self, friends) -> dict:
        # フレンドのonline statusを取得
        friend_ids          = [friend['friend_id'] for friend in friends]
        friend_statuses     = UserStatus.objects.filter(user_id__in=friend_ids).values('user_id', 'is_online')
        friend_status_dict  = {status['user_id']: status['is_online'] for status in friend_statuses}
        return friend_status_dict


class GetFriendRequestListAPI(APIView):
    """
    userが受信・送信し、Pending状態のフレンド申請一覧を取得する
    key: nickname, friend_id
    """
    permission_classes = [IsAuthenticated]

    def get(self, request) -> Response:
        try:
            user = request.user

            sent_requests       = Friend.get_friends_as_sender(user, Friend.FriendStatus.PENDING)
            received_requests   = Friend.get_friends_as_receiver(user, Friend.FriendStatus.PENDING)

            # logger.debug(f'get_friend_requests: sent_request: {sent_requests}')
            # logger.debug(f'get_friend_requests: received_requests: {received_requests}')

            response = {
                'sent_requests'    : sent_requests,
                'received_requests': received_requests
            }
            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            error_msg = f'Unexpected error: {str(e)}'
            error_status = status.HTTP_500_INTERNAL_SERVER_ERROR
        response = {'error': error_msg}
        return Response(response, status=error_status)
