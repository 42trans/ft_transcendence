# docker/srcs/uwsgi-django/pong/blockchain/local_testnet/execute_addGameResult.py
from web3 import Web3, Account

def execute_addGameResult(w3, contract, data, private_key):
	"""
	Ethereumブロックチェーンにゲームの結果を記録するために、Hardhatでdeployしたスマートコントラクトの`addGameResult`関数を呼び出します。

	:目的・役割:
		- 記録する。Ethereumブロックチェーン(テストネット)に。

	:機能・処理:
		- `addGameResult`関数は、PongGameResult.solスマートコントラクトに定義されています。
			- スマートコントラクトの保存場所:
				- コンテナ: Hardhat
				- ローカル: docker/srcs/hardhat/hardhat_pj/contracts/PongGameResult.sol
		
	:Parameters:
		- w3 (Web3): Web3インスタンス。Ethereumネットワークへの接続に使用。
		- contract (Contract): 実行対象のスマートコントラクトのインスタンス。
		- data (dict): ゲーム結果に関するデータ。'match_id', 'player_1_score', 'player_2_score'のキーを含む。
		- winner (str): 勝者の名前。
		- loser (str): 敗者の名前。

	:Returns:
		- txn_receipt (dict): トランザクションのレシート。トランザクションの実行結果に関する情報を含む。
	"""
	match_id = data['match_id']
	player1_score = data['player_1_score']
	player2_score = data['player_2_score']

	if private_key:
		# ----------------------------
		# Public Testnet
		# ----------------------------
		nonce = w3.eth.get_transaction_count(w3.eth.default_account)
		transaction = contract.functions.addGameResult(match_id, player1_score, player2_score, winner, loser).build_transaction({
			'chainId': 11155111,
			'gas': 2000000,
			'gasPrice': w3.to_wei('10', 'gwei'),
			'nonce': nonce,
		})
		# トランザクションをローカルで署名
		signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)
		# 署名されたトランザクションを送信
		txn_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
		txn_receipt = w3.eth.wait_for_transaction_receipt(txn_hash)
		return txn_receipt
	else:
		# ----------------------------
		# Local Testnet
		# ----------------------------
		txn_hash = contract.functions.addGameResult(match_id, player1_score, player2_score, winner, loser).transact({'from': w3.eth.default_account})
		txn_receipt = w3.eth.wait_for_transaction_receipt(txn_hash)
		return txn_receipt 
