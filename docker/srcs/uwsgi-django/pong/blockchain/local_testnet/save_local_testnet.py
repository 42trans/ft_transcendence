# docker/srcs/uwsgi-django/pong/blockchain/local_testnet/save_local_testnet.py
from django.http import JsonResponse
import json
import os
from django.views.decorators.csrf import csrf_exempt
from .read_and_extract_contract_info import read_and_extract_contract_info
from .setup_web3_and_contract import setup_web3_and_contract
from .process_game_result import process_game_result
from .execute_addGameResult import execute_addGameResult
from .debug_save_testnet import debug_save_testnet
# --------------------------------------
# 指定のAPIにPOSTならば、テストネットワークに保存を実行
# --------------------------------------
@csrf_exempt
def save_local_testnet(request, local_testnet_name):
	"""
	POSTリクエストを受け取り、Ethereumテストネットワークにゲームの結果を記録します。

	:機能・処理:
		- APIのURLによって、使用するテストネットワークを判別します。
			- api/save_local_testnet/<str:local_testnet_name>
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
			# --------------------------------------
			# API URLによる分岐
			# --------------------------------------
			if local_testnet_name == 'ganache':
				local_network_url = 'http://ganache:8545'
				contract_info_path = '../../../share_hardhat/contractInfo-ganache.json'
			elif local_testnet_name == 'hardhat':
				local_network_url = 'http://hardhat:8545'
				contract_info_path = '../../../share_hardhat/contractInfo-hardhat.json'
			else:
				return JsonResponse({'status': 'error', 'message': 'Unknown network'}, status=400)

			# APIに渡されたJSONを変数に格納
			data = json.loads(request.body.decode('utf-8'))
			# --------------------------------------
			# サブ関数による処理 
			# --------------------------------------
			# 設定を読み込む。EVMベースのテストネットワークのコントラクトに関する。
			contract_address, contract_abi = read_and_extract_contract_info(contract_info_path)
			# インスタンスを生成する。スマートコントラクトの。Web3インスタンスを初期化し、デフォルトアカウントを設定してから。
			w3, contract = setup_web3_and_contract(local_network_url, contract_address, contract_abi)
			# 勝者を判定する
			winner, loser = process_game_result(data)
			# 記録する。Ethereumブロックチェーン(テストネット)に。
			txn_receipt = execute_addGameResult(w3, contract, data, winner, loser)
			# --------------------------------------
			# コンテナのコンソールにlog出力
			response_data = debug_save_testnet(contract_address, local_network_url, w3.eth.chain_id, contract, txn_receipt['transactionHash'], txn_receipt)
			# --------------------------------------
			# debug
			# print(f"winner: {winner}")
			# print(f"loser: {loser}")
			# --------------------------------------
		except Exception as e:
			response_data = {'status': 'error', 'message': str(e)}

		return JsonResponse(response_data, json_dumps_params={'ensure_ascii': False})

	return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
