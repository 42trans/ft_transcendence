import requests
import os

class CheckNetwork:
	"""
	EVMテストネットワークの可用性を確認するためのメソッドを提供するクラス
	"""

	@staticmethod
	def post_check_network(network_type):
		if network_type == 'ganache':
			network_url = 'http://ganache:8545'
		elif network_type == 'hardhat':
			network_url = 'http://hardhat:8545'
		elif network_type == 'sepolia':
			infura_api_key = os.getenv('INFURA_API_KEY')
			network_url = f'https://sepolia.infura.io/v3/{infura_api_key}'
		else:
			raise ValueError("Unsupported network type.")

		# テスト環境が正常に稼働しているかチェックするためのサンプル的なリクエストを構築
		# 内容: テスト環境のEthereumサーバーのバージョンをリクエスト
		# "jsonrpc": "2.0": JSON-RPCプロトコルのバージョン
		# "method": "web3_clientVersion": JSON-RPCを介して実行したいメソッドを指定
		# "params": []: メソッドに渡すパラメーターのリスト
		# "id": 1: リクエストに一意のIDを割り当て。任意
		data = {
			"jsonrpc": "2.0",
			"method": "web3_clientVersion",
			"params": [],
			"id": 1
		}

		# requests ライブラリを使用して、Pythonの辞書をJSON形式に変換してリクエストのボディとして送信
		response = requests.post(network_url, json=data)
		# raise_for_status(): HTTPエラーコード（例：400や500）を含む場合に例外を発生
		response.raise_for_status()

		# resultキーが存在しない or False（空文字列,Noneなど）の場合
		# get('result'): JSONからresultフィールドを取得
		if not response.json().get('result'):
			raise Exception(f"{network_type} is running but returned an unexpected response.")
