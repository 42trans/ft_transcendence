
# HTTPリクエストを模倣
from django.test import Client, TestCase
# URLパターン名からURLを生成
from django.urls import reverse
# ganacheコンテナの起動チェック
from .check_network import CheckNetwork
from django.test import override_settings


@override_settings(SECURE_SSL_REDIRECT=False)
class TestGanacheFetch(TestCase):
	"""
	Django のAPIで Ganache のテストネットからのデータ取得をテストするクラス
	"""
	# 各テストメソッドが実行される前に毎回自動的に呼び出される。テスト環境を初期化。各テストが独立して実行される。
	def setUp(self):
		# DjangoのテストClientインスタンスを作成
		self.client = Client()
		CheckNetwork.post_check_network('ganache')

	def test_fetch_game_result_unknown_network(self):
		"""存在しないネットワーク名"""
		# API(ビュー)に対応するURLを生成
		url = reverse('fetch_testnet', args=['unknown'])
		# APIにGETリクエスト
		response = self.client.get(url)
		# レスポンスの検証。assertEqual: 値が等しいかを確認。 
		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.json(), {'status': 'error', 'message': 'Unknown network'})

	def test_fetch_game_result_invalid_query(self):
		"""クエリパラメータが存在する（クエリは受け付けない仕様）"""
		# 不正なクエリパラメータを使用
		url = reverse('fetch_testnet', args=['ganache']) + '?invalidParam=123'
		response = self.client.get(url)
		self.assertEqual(response.status_code, 400)
		# エラーメッセージの内容に応じて検証を行う
		self.assertEqual(response.json(), {'status': 'error', 'message': 'Query parameters are not supported'})
