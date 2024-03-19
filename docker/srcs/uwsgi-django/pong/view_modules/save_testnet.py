# docker/srcs/uwsgi-django/pong/view_modules/save_testnet.py
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from .testnet.save_util import load_script_settings
from .testnet.save_setup_and_save import setup_and_save_to_testnet_environment
from .testnet.save_debug import debug_save_testnet
# --------------------------------------
# 指定のAPIにPOSTならば、テストネットワークに保存を実行
# --------------------------------------
@csrf_exempt
def save_testnet(request):
	if request.method == 'POST':
		# 変数宣言　default値
		response_data = {'status': 'error', 'message': 'Initial error'}
		try:
			# APIに渡されたJSONを変数に格納
			data = json.loads(request.body.decode('utf-8'))
			# スクリプトの設定をロード
			contract_address, ganache_network_url, contract_abi = load_script_settings()
			# テストネットワークに保存
			w3, contract, txn_receipt = setup_and_save_to_testnet_environment(data, contract_address, ganache_network_url, contract_abi)
			# debug用log出力
			response_data = debug_save_testnet(contract_address, ganache_network_url, w3.eth.chain_id, contract, txn_receipt['transactionHash'], txn_receipt)
		except Exception as e:
			response_data = {'status': 'error', 'message': str(e)}

		return JsonResponse(response_data, json_dumps_params={'ensure_ascii': False})

	return JsonResponse({'status': 'error', 'message': 'Invalid request'}, status=400)
