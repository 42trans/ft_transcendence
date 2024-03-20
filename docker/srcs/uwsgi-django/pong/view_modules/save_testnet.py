# docker/srcs/uwsgi-django/pong/view_modules/save_testnet.py
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from .testnet.read_and_extract_contract_info import read_and_extract_contract_info
from .testnet.setup_web3_and_contract import setup_web3_and_contract
from .testnet.process_game_result import process_game_result
from .testnet.execute_addGameResult import execute_addGameResult
from .testnet.save_debug import debug_save_testnet
# --------------------------------------
# 指定のAPIにPOSTならば、テストネットワークに保存を実行
# --------------------------------------
@csrf_exempt
def save_testnet(request):
	"""
	POSTリクエストを受け取り、Ethereumテストネットワークにゲームの結果を記録します。

	:機能・処理:
		- テストネットワークの設定を読み込み、Web3インスタンスとスマートコントラクトのインスタンスを初期化します。  
		- その後、受け取ったゲーム結果をスマートコントラクトに記録します。  
		- 処理の結果として、トランザクションのレシートが返されます。  

	:Parameters:
		- request (HttpRequest): DjangoのHttpRequestオブジェクト。POSTメソッドとJSONボディを受け取ります。

	:Returns:
		- JsonResponse: トランザクションのハッシュを含むJSONレスポンス
	
	.. Note::
		- CSRF検証はこのビューで無効化されています(`@csrf_exempt`)
		- デバッグ情報はコンテナ内のコンソールに出力されます。
	"""
	if request.method == 'POST':
		# 変数宣言（default値）
		response_data = {'status': 'error', 'message': 'Initial error'}
		try:
			# APIに渡されたJSONを変数に格納
			data = json.loads(request.body.decode('utf-8'))
			# --------------------------------------
			# サブ関数による処理 ./testnet/*
			# --------------------------------------
			# 設定を読み込む。EVMベースのテストネットワークのコントラクトに関する。
			network_url, contract_address, contract_abi = read_and_extract_contract_info()
			# インスタンスを生成する。Web3インスタンスを初期化し、デフォルトアカウントを設定した上で、スマートコントラクトの。
			w3, contract = setup_web3_and_contract(network_url, contract_address, contract_abi)
			# 勝者を判定する
			winner, loser = process_game_result(data)
			# 記録する。Ethereumブロックチェーン(テストネット)に。
			txn_receipt = execute_addGameResult(w3, contract, data, winner, loser)
			# --------------------------------------
			# コンテナのコンソールにlog出力
			response_data = debug_save_testnet(contract_address, network_url, w3.eth.chain_id, contract, txn_receipt['transactionHash'], txn_receipt)
			# --------------------------------------
			# print debug
			# print(f"winner: {winner}")
			# print(f"loser: {loser}")
		except Exception as e:
			response_data = {'status': 'error', 'message': str(e)}

		return JsonResponse(response_data, json_dumps_params={'ensure_ascii': False})

	return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
