# docker/srcs/uwsgi-django/pong/blockchain/local_testnet/fetch_testnet.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .contract_helpers.read_and_extract_contract_info import read_and_extract_contract_info
from .contract_helpers.setup_web3_and_contract import setup_web3_and_contract
from .contract_helpers.get_network_settings import get_network_settings
import logging

# ロガーの設定
logger = logging.getLogger(__name__)

@csrf_exempt
def fetch_testnet(request, testnet_name):
	"""
	GETリクエストを受け取り、Ethereumテストネットワークからすべてのゲーム結果を取得します。

	:機能・処理:
		- Hardhat, Ganacheなどのテストネットワークから記録を取得する共通の関数です。
		- APIのURLによって、使用するテストネットワークを判別します。
			- api/save_testnet/<str:testnet_name>
		- テストネットワークの設定を読み込み、Web3インスタンスとスマートコントラクトのインスタンスを初期化します。
		- スマートコントラクトからすべてのゲーム結果を読み取り、クライアントに返します。

	:Parameters:
		- request (HttpRequest): DjangoのHttpRequestオブジェクト。GETメソッドを受け取ります。

	:Returns:
		- JsonResponse: 取得したゲーム結果のリストを含むJSONレスポンス
	"""
	if request.method == 'GET':
		# リクエストにクエリパラメータが含まれている場合エラー(クエリ:method GETで?以降の文字列)
		if request.GET:
			return JsonResponse({'status': 'error', 'message': 'Query parameters are not supported'}, status=400)
		# 変数宣言（default値の設定）
		response_data = {'status': 'error', 'message': 'Initial error'}
		try:
			print(f"Request to fetch_testnet with testnet_name: {testnet_name}")

			# テストネットワークURLとコントラクト情報のパスを取得 API URLによって判別
			local_network_url, contract_info_path = get_network_settings(testnet_name)
			if local_network_url is None:
				return contract_info_path

			print(f"Network URL: {local_network_url}, Contract Info Path: {contract_info_path}")

			# 設定を読み込む
			contract_address, contract_abi = read_and_extract_contract_info(contract_info_path)
			# インスタンスを生成
			print(f"Contract Address: {contract_address}")
			w3, contract = setup_web3_and_contract(local_network_url, contract_address, contract_abi)

			print(f"２　Contract Address: {contract_address}")

			# すべてのゲーム結果を取得
			game_results = contract.functions.getAllGameResults().call()

			print(f"Game Results: {game_results}")

			# 結果をフォーマットする
			formatted_results = [
				{
					'matchId': result[0],
					'player1Score': result[1],
					'player2Score': result[2],
					'winnerName': result[3],
					'loserName': result[4],
					'date': result[5]
				} for result in game_results
			]
			response_data = {'status': 'success', 'data': formatted_results}
		except Exception as e:
			print(f"DEBUG: {str(e)}")
			logger.error(f"Error: {str(e)}")
			response_data = {'status': 'error', 'message': str(e)}

		return JsonResponse(response_data, json_dumps_params={'ensure_ascii': False})

	return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
