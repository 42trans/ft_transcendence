import logging
from django.http import JsonResponse
from accounts.models import CustomUser, Friend
from django.views.decorators.csrf import csrf_exempt
from django.db.models import F, Q

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s - [in %(funcName)s: %(lineno)d]',
)

logger = logging.getLogger('accounts')


@csrf_exempt  # todo: tmp
def send_friend_request(request, user_id):
    try:
        user = request.user
        if not user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'}, status=401)

        friend = CustomUser.objects.get(id=user_id)

        # 自分自身には友達申請を送れないようにする
        if user == friend:
            return JsonResponse({'error': 'Cannot send request to yourself.'}, status=400)

        # 既に申請が存在するか、または既に友達かどうかをチェック
        if Friend.objects.filter(sender=user, receiver=friend).exists():
            return JsonResponse({'error': 'Friend request already sent or already friends.'}, status=400)

        # 友達申請を作成
        Friend.objects.create(sender=user, receiver=friend)
        return JsonResponse({'status': 'Friend request sent success'})

    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)


@csrf_exempt  # todo: tmp
def cancel_friend_request(request, user_id):
    """
    send_friend_requestで送信した友達申請をキャンセル
    """
    try:
        user = request.user
        if not user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'}, status=401)

        friend = CustomUser.objects.get(id=user_id)
        if user == friend:
            return JsonResponse({'error': 'Cannot send request to yourself.'}, status=400)

        # リクエストを取得
        friend_request = Friend.objects.get(sender=user, receiver=friend, status='pending')

        # リクエストをデータベースから削除
        friend_request.delete()
        return JsonResponse({'status': 'Friend request cancelled'}, status=200)

    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)
    except Friend.DoesNotExist:
        return JsonResponse({'error': 'Friend request not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'Unexpected error: {str(e)}'}, status=500)


@csrf_exempt  # todo: tmp
def accept_friend_request(request, user_id):
    try:
        user = request.user
        if not user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'}, status=401)

        friend = CustomUser.objects.get(id=user_id)
        if user == friend:
            return JsonResponse({'error': 'Cannot send request to yourself.'}, status=400)

        friend_request = Friend.objects.get(sender=friend, receiver=user, status='pending')

        # リクエストのステータスを更新
        friend_request.status = Friend.FriendStatus.ACCEPTED
        friend_request.save()
        return JsonResponse({'status': 'Success: accept request'}, status=200)

    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)
    except Friend.DoesNotExist:
        return JsonResponse({'error': 'Friend request not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'Unexpected error: {str(e)}'}, status=500)


@csrf_exempt  # todo: tmp
def reject_friend_request(request, user_id):
    try:
        user = request.user
        if not user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'}, status=401)

        friend = CustomUser.objects.get(id=user_id)
        if user == friend:
            return JsonResponse({'error': 'Cannot send request to yourself.'}, status=400)

        friend_request = Friend.objects.get(sender=friend, receiver=user, status='pending')

        # リクエストのステータスを更新
        # friend_request.status = Friend.FriendStatus.REJECTED
        # friend_request.save()

        # statusをREJECTEDに変更すると、再度Friend Requestを送信できないため、friend_requestを削除する
        friend_request.delete()
        return JsonResponse({'status': 'Success: reject request'}, status=200)

    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)
    except Friend.DoesNotExist:
        return JsonResponse({'error': 'Friend request not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'Unexpected error: {str(e)}'}, status=500)


@csrf_exempt  # todo: tmp
def delete_friend(request, user_id):
    try:
        user = request.user
        if not user.is_authenticated:
            return JsonResponse({'error': 'Unauthorized'}, status=401)

        friend = CustomUser.objects.get(id=user_id)
        if user == friend:
            return JsonResponse({'error': 'Cannot send request to yourself.'}, status=400)

        friend_requests = Friend.objects.filter(
            Q(sender=user, receiver=friend) | Q(sender=friend, receiver=user),
            status='accepted'
        )

        if not friend_requests.exists():
            return JsonResponse({'error': 'Friend not found.'}, status=404)

        friend_requests.delete()
        return JsonResponse({'status': 'Success: delete friend'}, status=200)

    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)
    except Friend.DoesNotExist:
        return JsonResponse({'error': 'Friend request not found.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'Unexpected error: {str(e)}'}, status=500)


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
    friends = list(friends_as_sender) + list(friends_as_receiver)
    friends_sorted = sorted(friends, key=lambda x: x['nickname'])
    renamed_friends = [{
        'id': friend['friend_id'], 'nickname': friend['nickname']
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
