# docker/srcs/uwsgi-django/pong/view_modules/testnet/save_debug.py
# ------------------------------------------------------
# debug用 変数の出力
# ------------------------------------------------------
def print_debug_info(contract_address, ganache_network_url, chain_id, contract, txn_hash, txn_receipt):
	print(f"CONTRACT_ADDRESS: {contract_address}")
	print(f"EVM_TEST_NETWORK_URL: {ganache_network_url}")
	print(f"chain_id: {chain_id}")
	print(f"contract: {contract}")
	print(f"txn_hash: {txn_hash}")
	print(f"txn_receipt: {txn_receipt}")

# ------------------------------------------------------
# debug用 直前に登録したデータをテストネットワークから取得
# ------------------------------------------------------
def retrieve_and_format_game_results(contract):
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
		return {'status': 'success', 'saved_game_result': saved_game_result}
	else:
		return {'status': 'error', 'message': 'No game results found.'}
# ------------------------------------------------------
# レスポンスデータをログ(コンテナ内)に出力
# ------------------------------------------------------
def print_response_data(response_data):
	print("レスポンスデータ:")
	for key, value in response_data.items():
		if isinstance(value, dict):  # 値が辞書の場合、さらにその内容を出力
			print(f"{key}:")
			for sub_key, sub_value in value.items():
				print(f"  {sub_key}: {sub_value}")
		else:
			print(f"{key}: {value}")
# ------------------------------------------------------
# 上記debug用関数を呼び出す
# ------------------------------------------------------
def debug_save_testnet(ganache_url, contract_address, chain_id, contract,txn_hash, txn_receipt):
	print_debug_info(ganache_url, contract_address, chain_id, contract,txn_hash, txn_receipt)
	# 最後に追加したゲーム結果の取得
	response_data = retrieve_and_format_game_results(contract)
	print_response_data(response_data)
	return response_data
