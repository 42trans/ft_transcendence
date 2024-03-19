# docker/srcs/uwsgi-django/pong/view_modules/save_game_results_hardhat.py
from web3 import Web3
from django.http import JsonResponse
import json
import os
from django.views.decorators.csrf import csrf_exempt
# --------------------------------------
# テストネットワークの設定
# --------------------------------------
# Hardhat localの場合
# HARDHAT_NETWORK_URL = 'http://hardhat:8545'
# ---
# Ganache のテストネットワークを使用する場合
# GANACHE_NETWORK_URL = 'http://ganache:8545'
# CONTRACT_ADDRESS = "0x8E24bFD2b3682b3456654168BC6E7Bd663A04f5a"
# 環境変数からGANACHE_NETWORK_URLとGANACHE_CONTRACT_ADDを取得
GANACHE_NETWORK_URL = os.getenv('GANACHE_NETWORK_URL', 'http://ganache:8545')
CONTRACT_ADDRESS = os.getenv('GANACHE_CONTRACT_ADD', '')
# --------------------------------------
# ABIの設定
# --------------------------------------
# スクリプトの現在のディレクトリからパスを作成
current_dir = os.path.dirname(os.path.abspath(__file__))
abi_path = os.path.join(current_dir, 'contract_abi.json')
# ABIファイルを読み込む
with open(abi_path, 'r') as abi_definition:
	CONTRACT_ABI = json.load(abi_definition)
# --------------------------------------
# 指定のAPIにPOSTならば、テストネットワークに保存を実行
# --------------------------------------
@csrf_exempt
def save_game_result_hardhat(request):
	if request.method == 'POST':
		try:
			# --------------------------------------
			# APIに渡されたJSONの値を変数に格納
			# --------------------------------------
			data = json.loads(request.body.decode('utf-8'))
			matchId = data.get('match_id')
			player1Score = data.get('player_1_score')
			player2Score = data.get('player_2_score')
			player1Name = data.get('player_1_name')
			player2Name = data.get('player_2_name')
			# --------------------------------------
			# 勝者の判定
			# --------------------------------------
			winner = player1Name if player1Score > player2Score else player2Name
			loser = player2Name if player1Score > player2Score else player1Name
			# --------------------------------------
			# テストネットワークに接続
			# --------------------------------------
			# w3 = Web3(Web3.WebsocketProvider(HARDHAT_NETWORK_URL))
			# w3 = Web3(Web3.WebsocketProvider(GANACHE_NETWORK_URL))
			w3 = Web3(Web3.HTTPProvider(GANACHE_NETWORK_URL))
			w3.eth.defaultAccount = w3.eth.accounts[0]  # Hardhatのデフォルトアカウントを使用
			contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)
			# --------------------------------------
			# debug
			# --------------------------------------
			print(f"GANACHE_NETWORK_URL: {GANACHE_NETWORK_URL}")
			print(f"CONTRACT_ADDRESS: {CONTRACT_ADDRESS}")			
			chain_id = w3.eth.chain_id
			print(f"chain_id: {chain_id}")
			print(f"contract: {contract}")
			# --------------------------------------
			# スマートコントラクトの関数を呼び出し
			txn_hash = contract.functions.addGameResult(
				matchId,
				player1Score,
				player2Score,
				winner,
				loser
			).transact({'from': w3.eth.defaultAccount})
			txn_receipt = w3.eth.wait_for_transaction_receipt(txn_hash)
			# --------------------------------------
			# デバッグ出力
			# --------------------------------------
			print(f"txn_hash: {txn_hash}")
			print(f"txn_receipt: {txn_receipt}")
			# --------------------------------------
			# 最後に追加したゲーム結果の取得
			game_results = contract.functions.getAllGameResults().call()
			latest_result_index = len(game_results) - 1
			if latest_result_index >= 0:
				latest_result = contract.functions.getGameResult(latest_result_index).call()
				saved_game_result = {
					'match_id': latest_result[0],
					'player_1_score': latest_result[1],
					'player_2_score': latest_result[2],
					'winner': latest_result[3],
					'loser': latest_result[4],
					'date': latest_result[5]
				}
				response_data = {
					'status': 'success',
					'saved_game_result': saved_game_result
				}
			else:
				response_data = {'status': 'error', 'message': 'No game results found.'}

		except Exception as e:
			response_data = {'status': 'error', 'message': str(e)}

		print("レスポンスデータ:")
		for key, value in response_data.items():
			if isinstance(value, dict):  # 値が辞書の場合、さらにその内容を出力
				print(f"{key}:")
				for sub_key, sub_value in value.items():
					print(f"  {sub_key}: {sub_value}")
			else:
				print(f"{key}: {value}")
		print("--- ok ---")
		return JsonResponse(response_data, json_dumps_params={'ensure_ascii': False})

	return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
