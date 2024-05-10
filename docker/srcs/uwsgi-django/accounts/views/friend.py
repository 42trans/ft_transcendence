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


def get_friends(request):
    user = request.user

    if not user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    # 送信者としてのフレンドリクエスト
    friends_as_sender = Friend.objects.filter(
        sender=user,
        status=Friend.FriendStatus.ACCEPTED
    ).annotate(
        nickname=F('receiver__nickname'),
        friend_id=F('receiver_id')
    ).values(
        'nickname', 'friend_id'
    ).order_by('nickname')

    # 受信者としてのフレンドリクエスト
    friends_as_receiver = Friend.objects.filter(
        receiver=user,
        status=Friend.FriendStatus.ACCEPTED
    ).annotate(
        nickname=F('sender__nickname'),
        friend_id=F('sender_id')
    ).values(
        'nickname', 'friend_id'
    ).order_by('nickname')

    # リストを統合してソート
    friends         = list(friends_as_sender) + list(friends_as_receiver)
    friends_sorted  = sorted(friends, key=lambda x: x['nickname'])

    # フレンドのステータス情報を取得
    friend_ids          = [friend['friend_id'] for friend in friends_sorted]
    friend_statuses     = UserStatus.objects.filter(user_id__in=friend_ids).values('user_id', 'is_online')
    friend_status_dict  = {status['user_id']: status['is_online'] for status in friend_statuses}

    # フレンドのステータス情報を追加
    renamed_friends = [{
        'id'        : friend['friend_id'],
        'nickname'  : friend['nickname'],
        'status'    : friend_status_dict.get(friend['friend_id'], False)
    } for friend in friends_sorted]

    logger.debug(f'get_friends friends: {renamed_friends}')
    return JsonResponse({'friends': renamed_friends}, safe=False)

def get_friend_requests(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    # 申請中のフレンドリクエスト
    sent_requests = list(Friend.objects.filter(sender=user, status='pending')
                     .values('receiver__nickname', 'receiver_id'))
    sorted_sent_requests = sorted(sent_requests, key=lambda x: x['receiver__nickname'])
    # logger.debug(f'get_friend_requests: sorted_sent_requests: {sorted_sent_requests}')

    # 受信中のフレンドリクエスト
    received_requests = list(Friend.objects.filter(receiver=user, status='pending')
                         .values('sender__nickname', 'sender_id'))
    sorted_received_requests = sorted(received_requests, key=lambda x: x['sender__nickname'])
    # logger.debug(f'get_friend_requests: sorted_received_requests: {sorted_received_requests}')

    return JsonResponse({
        'sent_requests'    : sorted_sent_requests,
        'received_requests': sorted_received_requests
    }, safe=False)
