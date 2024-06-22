# docker/srcs/uwsgi-django/pong/blockchain/local_testnet/save_testnet.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .contract_helpers.read_and_extract_contract_info import read_and_extract_contract_info
from .contract_helpers.setup_web3_and_contract import setup_web3_and_contract
from .contract_helpers.process_game_result import process_game_result
from .contract_helpers.execute_addGameResult import execute_addGameResult
from .contract_helpers.debug_save_testnet import debug_save_testnet
from .contract_helpers.validate_request_data import validate_request_data
from .contract_helpers.get_network_settings import get_network_settings

# --------------------------------------
# 指定のAPIにPOSTならば、テストネットワークに保存を実行
# --------------------------------------
# @csrf_exempt
def save_testnet(request, testnet_name):
	"""
	POSTリクエストを受け取り、Ethereumテストネットワークにゲームの結果を記録します。

	:機能・処理:
		- Hardhat, Ganacheなどのテストネットワークに記録する共通の関数です。
		- APIのURLによって、使用するテストネットワークを判別します。
			- api/save_testnet/<str:testnet_name>
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
		# データの読み込み・検証
		data, error_response = validate_request_data(request.body)
		if error_response:
			return error_response
		try:
			# 変数宣言（default値の設定）
			response_data = {'status': 'error', 'message': 'Initial error'}
			# テストネットワークURLとコントラクト情報のパスを取得 API URLによって判別
			network_url, contract_info_path, private_key = get_network_settings(testnet_name)
			if network_url is None:
				return contract_info_path
			# 設定を読み込む。EVMベースのテストネットワークのコントラクトに関する。
			contract_address, contract_abi = read_and_extract_contract_info(contract_info_path)
			# インスタンスを生成する。スマートコントラクトの。Web3インスタンスを初期化し、デフォルトアカウントを設定してから。
			w3, contract = setup_web3_and_contract(network_url, contract_address, contract_abi, private_key)
			# 勝者を判定する
			winner, loser = process_game_result(data)
			# 記録する。Ethereumブロックチェーン(テストネット)に。
			txn_receipt = execute_addGameResult(w3, contract, data, winner, loser, private_key)
			# --------------------------------------
			# コンテナのコンソールにlog出力
			response_data = debug_save_testnet(contract_address, network_url, w3.eth.chain_id, contract, txn_receipt['transactionHash'], txn_receipt)
		except Exception as e:
			response_data = {'status': 'error', 'message': str(e)}

		return JsonResponse(response_data, json_dumps_params={'ensure_ascii': False})

	return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
