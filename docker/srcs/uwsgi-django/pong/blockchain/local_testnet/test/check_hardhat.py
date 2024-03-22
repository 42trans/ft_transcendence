from django.test import TestCase
import requests

class CheckHardhat(TestCase):
	"""
	Hardhat コンテナの起動を確認するクラス
	"""
	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		# hardhat起動確認用のシェルスクリプトを実行
		cls.post_check_hardhat()
			
	@classmethod
	def post_check_hardhat(cls):
		hardhat_url = 'http://hardhat:8545'

		# hardhat JSON-RPC エンドポイントに対する POST リクエストのボディ
		data = {
			"jsonrpc": "2.0",
			"method": "web3_clientVersion",
			"params": [],
			"id": 1
		}

		try:
			# hardhat へ POST リクエストを送信
			response = requests.post(hardhat_url, json=data)
			response.raise_for_status()  # 200 OK 以外のレスポンスは例外を投げる

			# レスポンスの内容をチェック
			if not response.json().get('result'):
				raise Exception("Hardhat is running but returned an unexpected response.")
			
		except requests.exceptions.RequestException as e:
			raise Exception("Could not connect to hardhat: {}".format(e)) from e
