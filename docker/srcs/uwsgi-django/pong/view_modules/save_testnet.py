# docker/srcs/uwsgi-django/pong/view_modules/save_testnet.py
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from .testnet.load_script_settings import load_script_settings
from .testnet.setup_web3_and_contract import setup_web3_and_contract
from .testnet.process_game_result import process_game_result
from .testnet.execute_addGameResult import execute_addGameResult
from .testnet.save_debug import debug_save_testnet
# --------------------------------------
# 指定のAPIにPOSTならば、テストネットワークに保存を実行
# --------------------------------------
@csrf_exempt
def save_testnet(request):
	if request.method == 'POST':
		# 変数宣言（default値）
		response_data = {'status': 'error', 'message': 'Initial error'}
		try:
			# APIに渡されたJSONを変数に格納
			data = json.loads(request.body.decode('utf-8'))
			# スクリプトの設定をロード
			network_url, contract_address, contract_abi = load_script_settings()
			w3, contract = setup_web3_and_contract(network_url, contract_address, contract_abi)
			winner, loser = process_game_result(data)
			txn_receipt = execute_addGameResult(w3, contract, data, winner, loser)
			# debug用log出力
			response_data = debug_save_testnet(contract_address, network_url, w3.eth.chain_id, contract, txn_receipt['transactionHash'], txn_receipt)
			# debug
			print(f"winner: {winner}")
			# print(f"loser: {loser}")
		except Exception as e:
			response_data = {'status': 'error', 'message': str(e)}


		return JsonResponse(response_data, json_dumps_params={'ensure_ascii': False})

	return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
