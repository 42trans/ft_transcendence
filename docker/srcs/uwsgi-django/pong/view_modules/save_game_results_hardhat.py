# docker/srcs/uwsgi-django/pong/view_modules/save_game_results_hardhat.py
from web3 import Web3
from django.http import JsonResponse
import json
import os
from django.views.decorators.csrf import csrf_exempt

# Hardhatのローカルネットワークの設定
# HARDHAT_NETWORK_URL = 'http://hardhat:8545'
GANACHE_NETWORK_URL = 'http://ganache:8545'
CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

# スクリプトの現在のディレクトリからパスを作成
current_dir = os.path.dirname(os.path.abspath(__file__))
abi_path = os.path.join(current_dir, 'contract_abi.json')
# ABIファイルを読み込む
with open(abi_path, 'r') as abi_definition:
	CONTRACT_ABI = json.load(abi_definition)

@csrf_exempt
def save_game_result_hardhat(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body.decode('utf-8'))
			matchId = data.get('match_id')
			player1Score = data.get('player_1_score')
			player2Score = data.get('player_2_score')
			player1Name = data.get('player_1_name')
			player2Name = data.get('player_2_name')

			winner = player1Name if player1Score > player2Score else player2Name
			loser = player2Name if player1Score > player2Score else player1Name

			# Hardhatのテストネットワークに接続
			# w3 = Web3(Web3.WebsocketProvider(HARDHAT_NETWORK_URL))
			w3 = Web3(Web3.WebsocketProvider(GANACHE_NETWORK_URL))
			w3.eth.defaultAccount = w3.eth.accounts[0]  # Hardhatのデフォルトアカウントを使用
			contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

			# コントラクトへの接続前
			print(f"GANACHE_NETWORK_URL: {GANACHE_NETWORK_URL}")
			print(f"CONTRACT_ADDRESS: {CONTRACT_ADDRESS}")
			# debug
			chain_id = w3.eth.chain_id
			print(f"chain_id: {chain_id}")
			print(f"contract: {contract}")

			# スマートコントラクトの関数を呼び出し
			txn_hash = contract.functions.addGameResult(
				matchId,
				player1Score,
				player2Score,
				winner,
				loser
			).transact({'from': w3.eth.defaultAccount})
			txn_receipt = w3.eth.wait_for_transaction_receipt(txn_hash)

			# デバッグ出力
			# print(f"txn_hash: {txn_hash}")
			print(f"txn_receipt: {txn_receipt}")

			# 保存されたゲーム結果の検証
			try:
				# 最後に追加したゲーム結果のインデックスを取得
				game_results = contract.functions.getAllGameResults().call()
				latest_result_index = len(game_results) - 1
				if latest_result_index >= 0:  # 結果が1つでも存在するか確認
					# 最後に追加された結果を取得
					latest_result = contract.functions.getGameResult(latest_result_index).call()
					# 取得した結果を確認
					saved_match_id = latest_result[0]  # または対応するフィールド
					saved_player1_score = latest_result[1]  # または対応するフィールド
					# 他のフィールドも同様に確認
					print(f"Saved game result: Match ID = {saved_match_id}, Player 1 Score = {saved_player1_score}, ...")
				else:
					print("No game results found.")
			except Exception as e:
				print(f"Error retrieving saved game results: {e}")



			return JsonResponse({'status': 'success', 'txn_receipt': txn_receipt.transactionHash.hex()})
		except Exception as e:
			return JsonResponse({'status': 'error', 'message': str(e)})
	return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
