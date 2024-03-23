# Django固有のテスト機能を利用するため
from django.test import TestCase
# mockするため
from unittest.mock import patch
# テスト対象のimport: setup_web3_and_contract関数
from ..contract_helpers.setup_web3_and_contract import setup_web3_and_contract

# Pythonのクラスはキャメルケース、ファイル名はスネークケース
# TestCaseクラスを継承
class TestSetupWeb3AndContract(TestCase):
	"""
	setup_web3_and_contract関数の正常な動作と例外処理の動作をテストするクラス
	"""
	# @patch = モック:テスト中に特定の関数を置き換え
	# 絶対パスでなければ認識しない ※import は相対パス(...locale_testnet.~)の記述が可能
	# unittest.mock.patchデコレータ: setup_web3_and_contract関数が依存する３つの内部関数をモック化
	@patch('pong.blockchain.contract_helpers.setup_web3_and_contract._create_contract_instance')
	@patch('pong.blockchain.contract_helpers.setup_web3_and_contract._configure_default_account')
	@patch('pong.blockchain.contract_helpers.setup_web3_and_contract._initialize_web3_instance')
	def test_setup_web3_and_contract_success(self, mock_initialize, mock_configure, mock_create):
		"""成功するケース"""
		# モック化された関数の戻り値を設定 モックなので自由に指定できる
		mock_initialize.return_value = 'mock_web3_instance'
		mock_configure.return_value = None
		mock_create.return_value = 'mock_contract_instance'

		# テスト対象関数を呼び出し。モック化された関数を内部で使用
		w3, contract = setup_web3_and_contract('dummy_url', 'dummy_address', 'dummy_abi')

		# 関数の戻り値（モックを使用した場合の結果）が期待通りかどうかを検証　
		self.assertEqual(w3, 'mock_web3_instance')
		self.assertEqual(contract, 'mock_contract_instance')

		# モック化された関数が期待通りの引数で正確に一回呼び出されたか念の為検証
		mock_initialize.assert_called_once_with('dummy_url')
		mock_configure.assert_called_once_with('mock_web3_instance')
		mock_create.assert_called_once_with('mock_web3_instance', 'dummy_address', 'dummy_abi')

	@patch('pong.blockchain.contract_helpers.setup_web3_and_contract._initialize_web3_instance')
	def test_initialize_web3_instance_failure(self, mock_initialize):
		"""内部で使用する_initialize_web3_instance()が失敗するケース"""
		# unittest.mock モジュールの side_effect 属性: 特定の動作（例外の発生や異なる値の返却など）をシミュレートする
		mock_initialize.side_effect = Exception('Initialization failed')

		try:
			setup_web3_and_contract('dummy_url', 'dummy_address', 'dummy_abi')
			# 期待と違う場合（例外が発生しなかった場合)
			self.fail("Exception was not raised")  
		except Exception as e:
			# 正常な場合（期待するメッセージが例外に含まれている）
			self.assertIn('Initialization failed', str(e))  
