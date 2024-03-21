from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .read_and_extract_contract_info import read_and_extract_contract_info
from .setup_web3_and_contract import setup_web3_and_contract

@csrf_exempt
def fetch_local_testnet(request, local_testnet_name):
	"""
	GETリクエストを受け取り、Ethereumテストネットワークからすべてのゲーム結果を取得します。

	:機能・処理:
		- APIのURLによって、使用するテストネットワークを判別します。
			- api/save_local_testnet/<str:local_testnet_name>
		- テストネットワークの設定を読み込み、Web3インスタンスとスマートコントラクトのインスタンスを初期化します。
		- スマートコントラクトからすべてのゲーム結果を読み取り、クライアントに返します。

	:Parameters:
		- request (HttpRequest): DjangoのHttpRequestオブジェクト。GETメソッドを受け取ります。

	:Returns:
		- JsonResponse: 取得したゲーム結果のリストを含むJSONレスポンス
	"""
	if request.method == 'GET':
		response_data = {'status': 'error', 'message': 'Initial error'}
		try:

			print (f"name: {local_testnet_name}")

			if local_testnet_name == 'ganache':
				local_network_url = 'http://ganache:8545'
				contract_info_path = '../../../share_hardhat/contractInfo-ganache.json'
			elif local_testnet_name == 'hardhat':
				local_network_url = 'http://hardhat:8545'
				contract_info_path = '../../../share_hardhat/contractInfo-hardhat.json'
			else:
				return JsonResponse({'status': 'error', 'message': 'Unknown network'}, status=400)

			# 設定を読み込む
			contract_address, contract_abi = read_and_extract_contract_info(contract_info_path)
			# インスタンスを生成
			w3, contract = setup_web3_and_contract(local_network_url, contract_address, contract_abi)
			# すべてのゲーム結果を取得
			game_results = contract.functions.getAllGameResults().call()
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
			response_data = {'status': 'error', 'message': str(e)}

		return JsonResponse(response_data, json_dumps_params={'ensure_ascii': False})

	return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
