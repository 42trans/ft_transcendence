# docker/srcs/uwsgi-django/pong/view_modules/testnet/execute_addGameResult.py
# ------------------------------------------------------
# スマートコントラクトの関数を呼び出す
# ------------------------------------------------------
def execute_addGameResult(w3, contract, data, winner, loser):
	match_id = data['match_id']
	player1_score = data['player_1_score']
	player2_score = data['player_2_score']
	# player1_name = data['player_1_name']
	# player2_name = data['player_2_name']

	txn_hash = contract.functions.addGameResult(match_id, player1_score, player2_score, winner, loser).transact({'from': w3.eth.defaultAccount})
	txn_receipt = w3.eth.wait_for_transaction_receipt(txn_hash)
	return txn_receipt 