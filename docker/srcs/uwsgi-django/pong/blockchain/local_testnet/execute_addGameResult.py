# docker/srcs/uwsgi-django/pong/blockchain/local_testnet/execute_addGameResult.py
def execute_addGameResult(w3, contract, data, winner, loser):
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
		- winner (str): 勝者のアドレス。
		- loser (str): 敗者のアドレス。

	:Returns:
		- txn_receipt (dict): トランザクションのレシート。トランザクションの実行結果に関する情報を含む。
	"""
	match_id = data['match_id']
	player1_score = data['player_1_score']
	player2_score = data['player_2_score']

	txn_hash = contract.functions.addGameResult(match_id, player1_score, player2_score, winner, loser).transact({'from': w3.eth.defaultAccount})
	txn_receipt = w3.eth.wait_for_transaction_receipt(txn_hash)

	# debug
	# print(f"debug txn_receipt: {txn_receipt}")

	return txn_receipt 