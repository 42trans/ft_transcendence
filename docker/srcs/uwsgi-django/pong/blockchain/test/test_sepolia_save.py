from django.test import Client, TestCase
# ビューの名前や URL パターン名をもとに URLを生成
from django.urls import reverse
import json
from .check_network import CheckNetwork

class TestGanashSave(TestCase):
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
		self.url = reverse('save_testnet', args=['sepolia'])
		CheckNetwork.post_check_network('sepolia')


	# ーーーーーーーーーーーーーーーーー
	# Eth節約のため、Djangoの自動テストでは登録テストは行わず、不正の場合のみ行う。
	# ーーーーーーーーーーーーーーーーー


	def test_save_game_result_unknown_network(self):
		"""不明なテストネットワークを指定"""
		response = self.client.post(reverse('save_testnet', args=['unknown']), json.dumps(self.data), content_type='application/json')
		self.assertEqual(response.status_code, 400)
		self.assertEqual(response.json(), {'status': 'error', 'message': 'Unknown network'})

	def test_save_game_result_bad_request(self):
		"""不正なデータでリクエストを送る"""
		response = self.client.post(reverse('save_testnet', args=['sepolia']), '{}', content_type='application/json')
		self.assertEqual(response.status_code, 400)  
		
	def test_save_game_result_invalid_method(self):
		"""不正なHTTPメソッド(GET)でリクエストを送る"""
		response = self.client.put(reverse('save_testnet', args=['sepolia']))
		self.assertEqual(response.status_code, 400) 

	def test_save_game_result_invalid_json(self):
		"""不正なJSON形式でリクエストを送る"""
		response = self.client.post(reverse('save_testnet', args=['sepolia']), '{bad json', content_type='application/json')
		self.assertEqual(response.status_code, 400)

	def test_save_game_result_missing_field(self):
		"""必須フィールド（match_id）が欠けているデータでリクエストを送る"""
		self.data = {"player_1_score": 10, "player_2_score": 5} 
		response = self.client.post(reverse('save_testnet', args=['sepolia']), json.dumps(self.data), content_type='application/json')
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
		response = self.client.post(reverse('save_testnet', args=['sepolia']), json.dumps(self.data), content_type='application/json')
		self.assertEqual(response.status_code, 400)
