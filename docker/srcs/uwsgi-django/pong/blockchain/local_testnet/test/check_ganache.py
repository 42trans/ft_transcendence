from django.test import TestCase
import requests

class check_ganache(TestCase):
	@classmethod
	def setUpClass(cls):
		super().setUpClass()
		# Ganache起動確認用のシェルスクリプトを実行
		cls.post_check_ganache()
			
	@classmethod
	def post_check_ganache(cls):
		ganache_url = 'http://ganache:8545'

		# Ganache JSON-RPC エンドポイントに対する POST リクエストのボディ
		data = {
			"jsonrpc": "2.0",
			"method": "web3_clientVersion",
			"params": [],
			"id": 1
		}

		try:
			# Ganache へ POST リクエストを送信
			response = requests.post(ganache_url, json=data)
			response.raise_for_status()  # 200 OK 以外のレスポンスは例外を投げる

			# レスポンスの内容をチェック
			if not response.json().get('result'):
				raise Exception("Ganache is running but returned an unexpected response.")
			
		except requests.exceptions.RequestException as e:
			raise Exception("Could not connect to Ganache: {}".format(e)) from e
