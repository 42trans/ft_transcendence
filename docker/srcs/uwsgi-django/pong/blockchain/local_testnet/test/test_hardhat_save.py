from django.test import Client
# ビューの名前や URL パターン名をもとに URLを生成
from django.urls import reverse
import json
from .check_hardhat import CheckHardhat

class TestGanashSave(CheckHardhat):
	"""
	Django のAPIで Hardhat のテストネットへの登録をテストするクラス
	"""
	def setUp(self):
		# HTTPリクエストを模倣するためのクライアントをインスタンス化
		self.client = Client()
		self.data = {
			"match_id": 9999,
			"player_1_score": 15,
			"player_2_score": 2,
			"player_1_name": "キュア赤",
			"player_2_name": "キュア青"
		}
		# テスト対象のURL
		self.url = reverse('save_local_testnet', args=['hardhat'])

	# test_で始まるメソッド: テストランナーによってテストメソッドとして扱われる
	def test_save_game_result_success(self):
		"""有効なデータでゲーム結果を保存する"""
		# self.client.post: HTTP POSTリクエスト
		# reverse関数: URLパターン名からURLを逆引き
		# json.dumps: Python辞書をJSON文字列に変換
		response = self.client.post(reverse('save_local_testnet', args=['hardhat']), json.dumps(self.data), content_type='application/json')
		self.assertEqual(response.status_code, 200)


	def test_save_game_result_success_hardhat(self):
		"""有効なデータでゲーム結果を保存する"""
		response = self.client.post(reverse('save_local_testnet', args=['hardhat']), json.dumps(self.data), content_type='application/json')
		self.assertEqual(response.status_code, 200)
		self.assertIn('date', response.json().get('saved_game_result', {}))

	def test_save_game_result_unknown_network(self):
		"""不明なテストネットワークを指定"""
		response = self.client.post(reverse('save_local_testnet', args=['unknown']), json.dumps(self.data), content_type='application/json')
		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.json(), {'status': 'error', 'message': 'Unknown network'})

	def test_save_game_result_bad_request(self):
		"""不正なデータでリクエストを送る"""
		response = self.client.post(reverse('save_local_testnet', args=['hardhat']), '{}', content_type='application/json')
		self.assertEqual(response.status_code, 400)  
		
	def test_save_game_result_invalid_method(self):
		"""不正なHTTPメソッド(GET)でリクエストを送る"""
		response = self.client.put(reverse('save_local_testnet', args=['hardhat']))
		self.assertEqual(response.status_code, 400) 

	def test_save_game_result_invalid_json(self):
		"""不正なJSON形式でリクエストを送る"""
		response = self.client.post(reverse('save_local_testnet', args=['hardhat']), '{bad json', content_type='application/json')
		self.assertEqual(response.status_code, 400)

	def test_save_game_result_missing_field(self):
		"""必須フィールド（match_id）が欠けているデータでリクエストを送る"""
		self.data = {"player_1_score": 10, "player_2_score": 5} 
		response = self.client.post(reverse('save_local_testnet', args=['hardhat']), json.dumps(self.data), content_type='application/json')
		self.assertEqual(response.status_code, 400)

	def test_save_game_result_negative_score(self):
		"""負のスコアを含むデータでリクエストを送る"""
		self.data = {
			"match_id": 9999,
			"player_1_score": -1, 
			"player_2_score": 5,
			"player_1_name": "キュア赤",
			"player_2_name": "キュア青"
		}
		response = self.client.post(reverse('save_local_testnet', args=['hardhat']), json.dumps(self.data), content_type='application/json')
		self.assertEqual(response.status_code, 400)
