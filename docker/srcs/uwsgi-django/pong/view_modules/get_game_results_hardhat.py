# docker/srcs/uwsgi-django/pong/view_modules/add_game_results_hardhat.py
from web3 import Web3
from django.http import JsonResponse
import json
import os
from django.views.decorators.csrf import csrf_exempt

# Hardhatのローカルネットワークの設定
HARDHAT_NETWORK_URL = 'http://hardhat:8545'
CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

# スクリプトの現在のディレクトリからパスを作成
current_dir = os.path.dirname(os.path.abspath(__file__))
abi_path = os.path.join(current_dir, 'contract_abi.json')
# ABIファイルを読み込む
with open(abi_path, 'r') as abi_definition:
	CONTRACT_ABI = json.load(abi_definition)

@csrf_exempt
def get_all_game_results_hardhat(request):
	if request.method == 'GET':
		try:
			# Hardhatのテストネットワークに接続
			w3 = Web3(Web3.HTTPProvider(HARDHAT_NETWORK_URL))
			w3.eth.defaultAccount = w3.eth.accounts[0]  # Hardhatのデフォルトアカウントを使用

			# コントラクトへの接続前
			print(f"CONTRACT_ADDRESS: {CONTRACT_ADDRESS}")
			contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

			# debug
			chain_id = w3.eth.chain_id
			print(f"chain_id: {chain_id}")
			print(f"contract--: {contract}")

			# スマートコントラクトの関数を呼び出し

			json_data = contract.functions.getGameResult(1).call()
			# json_data = contract.functions.getAllGameResults().call()
			# if len(json_data) == 0:
			# 	return JsonResponse({'status': 'success', 'game_results': []})

			# game_results = contract.functions.getAllGameResults().call([])
			# print("あいうえお")
			# for game_result in game_results:
			# 	print(f"ゲーム結果：{game_result}")

			# # 結果を辞書形式に変換
			# json_results = []
			# for game_result in game_results:
			# 	# json_results[game_result[0]] = {
			# 	json_results.append({
			# 		'match_id': game_result[0],
			# 		'player_1_score': game_result[1],
			# 		'player_2_score': game_result[2],
			# 		'winner_name': game_result[3],
			# 		'loser_name': game_result[4],
			# 		'date': game_result[5],
			# 	})
			# 	# }
			# # JSON形式に変換
			# json_data = json.dumps(json_results)

			# return JsonResponse({'status': 'success', 'game_results': json_results})
			return JsonResponse({'status': 'success', 'game_results': json_data})
		except Exception as e:
			return JsonResponse({'status': 'error', 'message': str(e)})
	return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
