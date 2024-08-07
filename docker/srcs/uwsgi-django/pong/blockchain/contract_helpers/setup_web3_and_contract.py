# docker/srcs/uwsgi-django/pong/blockchain/local_testnet/setup_web3_and_contract.py
from web3 import Web3, Account
import logging
# TODO:リファクタリング print debugをloggingに変更する

# コンソールに特定箇所のデバッグ出力(printfデバッグ的な用途)
# docker/srcs/uwsgi-django/trans_pj/settings.pyで pong を定義済み
	# 'pong': { 
	# 	'handlers': ['console'],
	# 	'level': 'DEBUG',
	# 	'propagate': True,
# pong_logger：pong のインスタンス。任意の名前
pong_logger = logging.getLogger('pong')


# ======================================================= 
# ファイル内でのみ使用する関数 
# ======================================================= 
def _initialize_web3_instance(network_url):
	"""
	Web3インスタンスを初期化（このファイル内でのみ使用する関数）

	.. Note::
	  - リアルタイム性が必要ならwebsocketを使用する
	    - w3 = Web3(Web3.WebsocketProvider(EVM_TEST_NETWORK_URL))
	"""
	w3 = Web3(Web3.HTTPProvider(network_url))

	# # -------------------
	# # APIキーの検証 Sepolia DEBUG用logging 
	# # -------------------
	# # 接続状態の確認、ブロック番号の取得(テスト)
	# is_connected = w3.is_connected()
	# latest_block = w3.eth.block_number if is_connected else '接続失敗'
	# # INFURAに直接接続
	# debug_infura_url = "https://sepolia.infura.io/v3/9301610ed4c24693b985f80eda16eb67"
	# debug_w3 = Web3(Web3.HTTPProvider(debug_infura_url))
	# debug_is_connected = debug_w3.is_connected()
	# debug_latest_block = debug_w3.eth.block_number if debug_is_connected else '接続失敗'
	# # 比較用にコンソール出力
	# pong_logger.debug(f"is_connected       接続状態: {is_connected}, 最新のブロック番号: {latest_block}")
	# pong_logger.debug(f"debug_is_connected 接続状態: {debug_is_connected}, debug_最新のブロック番号: {debug_latest_block}")
	# pong_logger.debug(f"debug Network          URL: {network_url}")
	# pong_logger.debug(f"debug debug_infura_url URL: {debug_infura_url}")
	# # -------------------

	return w3
# ------------------------------------------------------
def _configure_default_account(w3, private_key=None):
	"""
	Web3インスタンスに基づいてデフォルトアカウントを設定（このファイル内でのみ使用する関数）
	"""
	if private_key:
		account = Account.from_key(private_key)
		# pong_logger(f"debug private_key: {private_key}")
		# pong_logger(f"debug account: {account}")
		# pong_logger(f"debug account.address: {account.address}")
		w3.eth.default_account = account.address
	else:
		if len(w3.eth.accounts) > 0:
			w3.eth.default_account = w3.eth.accounts[0]
# ------------------------------------------------------
def _create_contract_instance(w3, contract_address, contract_abi):
	"""
	スマートコントラクトのインスタンスを生成（このファイル内でのみ使用する関数）
	"""
	return w3.eth.contract(address=contract_address, abi=contract_abi)
# ------------------------------------------------------


# ======================================================= 
# ファイルの外部に公開する関数 
# ======================================================= 
def setup_web3_and_contract(network_url, contract_address, contract_abi, private_key):
	"""
	Web3インスタンスを初期化し、デフォルトアカウントを設定した上で、スマートコントラクトのインスタンスを生成
	
	:目的・役割:
		- スマートコントラクトのインスタンスを生成
	:機能・処理内容:
		- Web3インスタンスを初期化し、デフォルトアカウントを設定した上で、スマートコントラクトのインスタンスを生成。
		- ファイル内のサブ関数を呼び出す
	"""
	try:
		# Web3インスタンスの初期化
		w3 = _initialize_web3_instance(network_url)

		# デフォルトアカウントの設定
		_configure_default_account(w3, private_key)
		
		# スマートコントラクトのインスタンス作成
		contract = _create_contract_instance(w3, contract_address, contract_abi)

		return w3, contract
	except Exception as e:
		raise