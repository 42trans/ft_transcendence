# docker/srcs/uwsgi-django/pong/view_modules/testnet/save_setup_and_save.py
from web3 import Web3
# ------------------------------------------------------
# Web3インスタンスを初期化する
# ------------------------------------------------------
def initialize_web3(network_url):
	w3 = Web3(Web3.HTTPProvider(network_url))
	# w3 = Web3(Web3.WebsocketProvider(HARDHAT_NETWORK_URL))
	# w3 = Web3(Web3.WebsocketProvider(GANACHE_NETWORK_URL))
	return w3
# ------------------------------------------------------
# デフォルトアカウントを設定する
# ------------------------------------------------------
def set_default_account(w3):
	if len(w3.eth.accounts) > 0:
		w3.eth.defaultAccount = w3.eth.accounts[0]
# ------------------------------------------------------
# スマートコントラクトをロードする
# ------------------------------------------------------
def load_contract(w3, contract_address, contract_abi):
	return w3.eth.contract(address=contract_address, abi=contract_abi)
# ------------------------------------------------------
# 勝者の判定を行う
# ------------------------------------------------------
def determine_winner(player1_score, player2_score, player1_name, player2_name):
	if player1_score > player2_score:
		# 勝者:player1
		return player1_name, player2_name
	else:
		# 勝者:player2
		return player2_name, player1_name
# ------------------------------------------------------
# スマートコントラクトの関数を呼び出す
# ------------------------------------------------------
def call_contract_function(w3, contract, match_id, player1_score, player2_score, winner, loser):
	txn_hash = contract.functions.addGameResult(match_id, player1_score, player2_score, winner, loser).transact({'from': w3.eth.defaultAccount})
	txn_receipt = w3.eth.wait_for_transaction_receipt(txn_hash)
	return txn_receipt  # トランザクションの領収書を返す
# ------------------------------------------------------
# JSONデータからゲーム結果を処理する
# ------------------------------------------------------
def process_game_result(data, contract, w3):
	match_id = data['match_id']
	player1_score = data['player_1_score']
	player2_score = data['player_2_score']
	player1_name = data['player_1_name']
	player2_name = data['player_2_name']

	winner, loser = determine_winner(player1_score, player2_score, player1_name, player2_name)

	txn_receipt = call_contract_function(w3, contract, match_id, player1_score, player2_score, winner, loser)
	# トランザクションの領収書を返す
	return txn_receipt  

# ------------------------------------------------------
# 上記の関数を呼び出す関数
# ------------------------------------------------------
def setup_and_save_to_testnet_environment(data, contract_address, ganache_network_url, contract_abi):

	# debug
	# print(f"contract_address: {contract_address}")
	# print(f"network_url: {ganache_network_url}")

	w3 = initialize_web3(ganache_network_url)
	set_default_account(w3)
	contract = load_contract(w3, contract_address, contract_abi)
	txn_receipt =  process_game_result(data, contract, w3)
	return w3, contract, txn_receipt