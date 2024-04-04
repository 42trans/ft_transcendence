# docker/srcs/uwsgi-django/pong/views.py
import json
import requests
import secrets
from django.shortcuts import redirect, render
from django.conf import settings
from django.urls import reverse
from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .models import PongGameResult
import logging


logger = logging.getLogger(__name__)


def index(request):
	return render(request, 'pong/index.html')


def index_bootstrap(request):
	return render(request, 'pong/bootstrap_index.html')

def sign_in_bootstrap(request):
	return render(request, 'pong/bootstrap_sign-in.html')


# def sign_in(request):
# 	return render(request, 'pong/sign-in.html')


def sign_in(request):
	logger.debug('\nsign in 1')

	# CSRF対策のためのstateを生成
	state = secrets.token_urlsafe()
	# stateをセッションに保存
	request.session['oauth_state'] = state

	# 42authの認証ページへのリダイレクトURLを構築
	params = {
		'client_id': settings.FT_CLIENT_ID,
		'redirect_uri': request.build_absolute_uri(reverse('sign_in_redirect')),
		'response_type': 'code',
		'scope': 'public',
		'state': state,
	}
	auth_url = f"https://api.intra.42.fr/oauth/authorize?{requests.compat.urlencode(params)}"

	logger.debug(f'sign in 2 client_id:{params['client_id']}')
	logger.debug(f'sign in 3 redirect_uri:{params['redirect_uri']}')
	logger.debug(f'sign in 4 state:{params['state']}')
	logger.debug(f'sign in 5 auth_url:{auth_url}')

	return redirect(auth_url)


def sign_in_redirect(request):
	logger.debug('\nsign in redirect 1')

	# セッションからstateを取得
	saved_state = request.session.get('oauth_state')
	# リクエストからstateを取得
	returned_state = request.GET.get('state')

	# stateが一致するか検証
	if saved_state != returned_state:
		# stateが一致しない場合はエラー処理
		return render(request, 'pong/error.html', {'message': 'Invalid state parameter'})


	# 42authから返されたコードを取得
	code = request.GET.get('code')
	if not code:
		error = request.GET.get('error', 'Unknown error')
		error_description = request.GET.get('error_description', 'No description provided.')

		# ログにエラーを記録するなどの処理を行う
		logger.error(f'OAuth error: {error}, Description: {error_description}')

		messages.error(request, 'Authorization code is missing. Please try again.')
		return render(request, 'pong/error.html')


	# アクセストークンを取得
	token_url = 'https://api.intra.42.fr/oauth/token'
	token_data = {
		'grant_type': 'authorization_code',
		'client_id': settings.FT_CLIENT_ID,
		'client_secret': settings.FT_SECRET,
		'code': code,
		'redirect_uri': request.build_absolute_uri(reverse('sign_in_redirect')),
	}

	logger.debug(f'sign in redirect 2 url:{token_url}')
	logger.debug(f'sign in redirect 3 client_id:{token_data['client_id']}')
	logger.debug(f'sign in redirect 4 code:{token_data['code']}')
	logger.debug(f'sign in redirect 5 redirect_uri:{token_data['redirect_uri']}')

	try:
		token_response = requests.post(token_url, data=token_data)
		token_response.raise_for_status()  # HTTPエラーをチェック
		token_json = token_response.json()
		access_token = token_json.get('access_token')

		# アクセストークンを使用してユーザー情報を取得
		user_info_url = 'https://api.intra.42.fr/v2/me'
		user_info_response = requests.get(user_info_url, headers={'Authorization': f'Bearer {access_token}'})
		user_info = user_info_response.json()
		formatted_user_info = json.dumps(user_info, indent=4)


		logger.debug(f'sign in redirect 6 user_info_url:{user_info_url}')
		logger.debug(f'sign in redirect 7 user_info_response:{user_info_response}')
		logger.debug(f'sign in redirect 8 user_info:{formatted_user_info}')

		expires_in = token_json.get('expires_in')  # expires_inの値を取得
		logger.debug(f'access token expires in: {expires_in} sec ({expires_in // 60} min)')

		# ここで、ユーザー情報を基にDjangoのユーザーセッションを作成する処理を行います。
		# 例えば、ユーザーが存在しなければ作成し、セッションにログイン情報を保存する等。
		# todo

	except requests.exceptions.RequestException as e:
		messages.error(request, 'error occurred')

	# ログイン後のリダイレクト先：相対パスだと sign-in-redirect/path/になる
	return redirect('/pong/bootstrap_index/')


def sign_up(request):
	return render(request, 'pong/sign-up.html')


def results(request):
	results_list = PongGameResult.objects.all().order_by("-date")
	context = {'results_list': results_list}
	return render(request, 'pong/results.html', context)


@csrf_exempt #開発用のおまじない
def save_game_result(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body.decode('utf-8'))  # 受け取ったJSONデータをPythonの辞書に変換
			match_id = data.get('match_id')
			player_1_score = data.get('player_1_score')
			player_2_score = data.get('player_2_score')

			# 勝者を決定
			winner = data.get('player_1_name') if player_1_score > player_2_score else data.get('player_2_name')
			loser = data.get('player_2_name') if player_1_score > player_2_score else data.get('player_1_name')

			# PongGameResult インスタンスを作成して保存
			game_result = PongGameResult(
				match_id=match_id,
				player_1_score=player_1_score,
				player_2_score=player_2_score,
				name_winner=winner,
				name_loser=loser,
			)
			game_result.save()

			return JsonResponse({'status': 'success'})
		except Exception as e:
			return JsonResponse({'status': 'error', 'message': str(e)})
	return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)

# custom template hth pong
def gw_index(request):
	return render(request, 'pong/gw/index.html')
def gw_game(request):
	return render(request, 'pong/gw/game.html')
def gw_tournament(request):
	return render(request, 'pong/gw/tournament.html')
