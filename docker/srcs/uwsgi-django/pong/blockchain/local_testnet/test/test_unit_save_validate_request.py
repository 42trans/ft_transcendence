from django.test import TestCase
from django.http import JsonResponse
import json
# from unittest.mock import patch
from pong.blockchain.local_testnet.validate_request_data import validate_request_data

"""
.. Note::
	- JsonResponseはDjangoのHttpResponseクラスを継承したサブクラス
	- Pythonの辞書やリストなどをJSON形式のレスポンスとしてクライアントに返すことが容易になる
	- オブジェクトのcontent属性は、レスポンスの本文を含み、JsonResponseが初期化されるとき、渡されたデータはjson.dumps()メソッドによってJSON文字列に変換
	- DjangoはこのJSON文字列をバイト列にエンコード
	- レスポンスの内容をテキストとして読みたい場合は `response.content.decode('utf-8')`
"""

class ValidateRequestDataTest(TestCase):
	"""
	validate_request_data()の正常な動作と例外処理の動作をテストするクラス
	"""
	def test_valid_request(self):
		"""有効なリクエスト"""
		# JSON文字列を作成
		request_body = json.dumps({
			"match_id": 1,
			"player_1_score": 15,
			"player_2_score": 5
		})
		# テスト対象の関数を単体実行
		data, error = validate_request_data(request_body)
		# データがNoneでないことを確認
		self.assertIsNotNone(data)
		# エラーがNoneであることを確認
		self.assertIsNone(error)

	def test_invalid_json_format(self):
		"""無効なJSON形式"""
		request_body = '{bad json'
		data, error = validate_request_data(request_body)
		self.assertIsNone(data)
		# エラーがJsonResponseのインスタンスであることを確認
		self.assertIsInstance(error, JsonResponse)
		# HTTPステータスコードが400であることを確認
		self.assertEqual(error.status_code, 400)
		# エラーメッセージの内容を検証
		self.assertEqual(error.content, b'{"status": "error", "message": "Invalid JSON format"}')

	def test_missing_field(self):
		"""必須フィールドが欠けているリクエスト"""
		request_body = json.dumps({
			"player_1_score": 15,
			"player_2_score": 5
		})
		data, error = validate_request_data(request_body)
		self.assertIsNone(data)
		self.assertIsInstance(error, JsonResponse)
		self.assertEqual(error.status_code, 400)
		self.assertEqual(error.content, b'{"status": "error", "message": "Invalid data"}')

	def test_negative_values(self):
		"""負の値を含むリクエスト"""
		request_body = json.dumps({
			"match_id": -1,
			"player_1_score": 15,
			"player_2_score": 5
		})
		data, error = validate_request_data(request_body)
		self.assertIsNone(data)
		self.assertIsInstance(error, JsonResponse)
		self.assertEqual(error.status_code, 400)
		self.assertEqual(error.content, b'{"status": "error", "message": "Negative scores are not allowed"}')

	def test_negative_values2(self):
		"""負の値を含むリクエスト"""
		request_body = json.dumps({
			"match_id": 123,
			"player_1_score": -1,
			"player_2_score": 5
		})
		data, error = validate_request_data(request_body)
		self.assertIsNone(data)
		self.assertIsInstance(error, JsonResponse)
		self.assertEqual(error.status_code, 400)
		self.assertEqual(error.content, b'{"status": "error", "message": "Negative scores are not allowed"}')

	def test_empty_body(self):
		"""bodyが空"""
		request_body = ''
		data, error = validate_request_data(request_body)
		self.assertIsNone(data)
		self.assertIsInstance(error, JsonResponse)
		self.assertEqual(error.status_code, 400)
		self.assertEqual(error.content, b'{"status": "error", "message": "Invalid JSON format"}')